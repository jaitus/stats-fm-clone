"use client";

import { useState, useCallback } from "react";
import type {
  SpotifyUser,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAudioFeatures,
  RecentlyPlayedItem,
  TimeRange,
} from "@/lib/spotify";

async function fetchSpotifyData<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const response = await fetch(`/api/spotify/data?${searchParams.toString()}`);

  if (!response.ok) {
    // Any auth failure (401) — fall back to demo data
    if (response.status === 401) {
      // Try token refresh first
      const refreshResponse = await fetch("/api/spotify/refresh", { method: "POST" });
      if (refreshResponse.ok) {
        const retryResponse = await fetch(`/api/spotify/data?${searchParams.toString()}`);
        if (retryResponse.ok) {
          return retryResponse.json() as Promise<T>;
        }
      }

      // Refresh failed or no token — use demo data
      // Auth failed — use demo data
      const demoParams = new URLSearchParams({ endpoint, ...params, demo: "true" });
      const demoResponse = await fetch(`/api/spotify/data?${demoParams.toString()}`);
      if (demoResponse.ok) {
        return demoResponse.json() as Promise<T>;
      }
    }

    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "API request failed");
  }

  return response.json() as Promise<T>;
}

export function useSpotifyData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (): Promise<SpotifyUser | null> => {
    try {
      setIsLoading(true);
      setError(null);
      return await fetchSpotifyData<SpotifyUser>("profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTopTracks = useCallback(
    async (timeRange: TimeRange = "medium_term"): Promise<SpotifyTrack[]> => {
      try {
        setIsLoading(true);
        setError(null);
        return await fetchSpotifyData<SpotifyTrack[]>("top-tracks", {
          time_range: timeRange,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch top tracks"
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchTopArtists = useCallback(
    async (timeRange: TimeRange = "medium_term"): Promise<SpotifyArtist[]> => {
      try {
        setIsLoading(true);
        setError(null);
        return await fetchSpotifyData<SpotifyArtist[]>("top-artists", {
          time_range: timeRange,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch top artists"
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchRecentlyPlayed = useCallback(
    async (): Promise<RecentlyPlayedItem[]> => {
      try {
        setIsLoading(true);
        setError(null);
        return await fetchSpotifyData<RecentlyPlayedItem[]>("recently-played");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch recently played"
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchAudioFeatures = useCallback(
    async (trackIds: string[]): Promise<SpotifyAudioFeatures[]> => {
      try {
        setIsLoading(true);
        setError(null);
        return await fetchSpotifyData<SpotifyAudioFeatures[]>(
          "audio-features",
          { ids: trackIds.join(",") }
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch audio features"
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    fetchProfile,
    fetchTopTracks,
    fetchTopArtists,
    fetchRecentlyPlayed,
    fetchAudioFeatures,
  };
}
