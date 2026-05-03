import { NextRequest, NextResponse } from "next/server";
import {
  getUserProfile,
  getTopTracks,
  getTopArtists,
  getRecentlyPlayed,
  getAudioFeatures,
  type TimeRange,
} from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get("endpoint");
  const timeRange = (searchParams.get("time_range") || "medium_term") as TimeRange;

  try {
    switch (endpoint) {
      case "profile": {
        const profile = await getUserProfile(accessToken);
        return NextResponse.json(profile);
      }
      case "top-tracks": {
        const tracks = await getTopTracks(accessToken, timeRange, 50);
        return NextResponse.json(tracks);
      }
      case "top-artists": {
        const artists = await getTopArtists(accessToken, timeRange, 50);
        return NextResponse.json(artists);
      }
      case "recently-played": {
        const recent = await getRecentlyPlayed(accessToken, 50);
        return NextResponse.json(recent);
      }
      case "audio-features": {
        const ids = searchParams.get("ids");
        if (!ids) {
          return NextResponse.json({ error: "Missing track IDs" }, { status: 400 });
        }
        try {
          const features = await getAudioFeatures(accessToken, ids.split(","));
          return NextResponse.json(features);
        } catch {
          // Audio features endpoint is restricted for many apps — gracefully return empty
          console.warn("[Spotify API] Audio features unavailable (403) — returning empty array");
          return NextResponse.json([]);
        }
      }
      default:
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }
  } catch (err) {
    console.error("[Spotify API] Error:", err);

    // If token expired, tell client to refresh
    if (err instanceof Error && err.message.includes("401")) {
      return NextResponse.json({ error: "Token expired", code: "TOKEN_EXPIRED" }, { status: 401 });
    }

    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}
