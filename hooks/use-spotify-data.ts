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
  params?: Record<string, string>,
  retryCount: number = 0
): Promise<T> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const response = await fetch(`/api/spotify/data?${searchParams.toString()}`);

  if (!response.ok) {
    const data = await response.json();

    // Auto-retry on rate limit (max 2 retries)
    if (data.code === "RATE_LIMITED" && retryCount < 2) {
      const waitMs = (retryCount + 1) * 5000; // 5s, then 10s
      console.log(`[Spotify] Rate limited, retrying in ${waitMs / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return fetchSpotifyData<T>(endpoint, params, retryCount + 1);
    }

    // Try to refresh token if expired
    if (data.code === "TOKEN_EXPIRED") {
      const refreshResponse = await fetch("/api/spotify/refresh", {
        method: "POST",
      });

      if (refreshResponse.ok) {
        // Retry the original request
        const retryResponse = await fetch(
          `/api/spotify/data?${searchParams.toString()}`
        );
        if (retryResponse.ok) {
          return retryResponse.json() as Promise<T>;
        }
      }

      // If refresh failed, redirect to re-authenticate
      window.location.href = "/api/auth/spotify";
      throw new Error("Token refresh failed");
    }

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
