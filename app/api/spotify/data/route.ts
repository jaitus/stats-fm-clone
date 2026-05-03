import { NextRequest, NextResponse } from "next/server";
import {
  getUserProfile,
  getTopTracks,
  getTopArtists,
  getRecentlyPlayed,
  getAudioFeatures,
  type TimeRange,
} from "@/lib/spotify";

// ─── In-memory cache to prevent Spotify rate limiting ────────────────────────
// Cache responses for 5 minutes — prevents repeated API hits on page refreshes
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    console.log(`[Cache] HIT: ${key}`);
    return entry.data as T;
  }
  if (entry) cache.delete(key); // expired
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
  console.log(`[Cache] SET: ${key} (expires in ${CACHE_TTL_MS / 1000}s)`);
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get("endpoint");
  const timeRange = (searchParams.get("time_range") || "medium_term") as TimeRange;

  // Build cache key from endpoint + params
  const cacheKey = `${endpoint}:${timeRange}:${searchParams.get("ids")?.slice(0, 20) || ""}`;

  // Check cache first
  const cached = getCached(cacheKey);
  if (cached !== null) {
    return NextResponse.json(cached);
  }

  try {
    let result: unknown;

    switch (endpoint) {
      case "profile": {
        result = await getUserProfile(accessToken);
        break;
      }
      case "top-tracks": {
        result = await getTopTracks(accessToken, timeRange, 50);
        break;
      }
      case "top-artists": {
        result = await getTopArtists(accessToken, timeRange, 50);
        break;
      }
      case "recently-played": {
        result = await getRecentlyPlayed(accessToken, 50);
        break;
      }
      case "audio-features": {
        const ids = searchParams.get("ids");
        if (!ids) {
          return NextResponse.json({ error: "Missing track IDs" }, { status: 400 });
        }
        try {
          result = await getAudioFeatures(accessToken, ids.split(","));
        } catch {
          console.warn("[Spotify API] Audio features unavailable (403) — returning empty array");
          result = [];
        }
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    // Cache the successful response
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Spotify API] Error:", err);

    // If token expired, tell client to refresh
    if (err instanceof Error && err.message.includes("401")) {
      return NextResponse.json({ error: "Token expired", code: "TOKEN_EXPIRED" }, { status: 401 });
    }

    // If rate limited, tell client to wait
    if (err instanceof Error && err.message.includes("429")) {
      return NextResponse.json(
        { error: "Spotify rate limit reached. Please wait a moment and refresh.", code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": "30" } }
      );
    }

    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}
