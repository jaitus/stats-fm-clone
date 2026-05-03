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
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const RATE_LIMIT_BACKOFF_MS = 30 * 60 * 1000; // 30 minutes backoff on 429

// Track when we're rate limited — don't hit Spotify at all during backoff
let rateLimitedUntil = 0;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data as T;
  }
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttl: number = CACHE_TTL_MS): void {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

// Default empty responses for each endpoint type
function getEmptyResponse(endpoint: string): unknown {
  switch (endpoint) {
    case "profile": return null;
    case "top-tracks": return [];
    case "top-artists": return [];
    case "recently-played": return [];
    case "audio-features": return [];
    default: return null;
  }
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get("endpoint");
  const timeRange = (searchParams.get("time_range") || "medium_term") as TimeRange;
  const cacheKey = `${endpoint}:${timeRange}:${searchParams.get("ids")?.slice(0, 20) || ""}`;

  // 1. Check cache first
  const cached = getCached(cacheKey);
  if (cached !== null) {
    return NextResponse.json(cached);
  }

  // 2. If we're in rate-limit backoff, return empty data immediately (don't hit Spotify)
  if (Date.now() < rateLimitedUntil) {
    console.log(`[Spotify] Rate limit backoff active (${Math.round((rateLimitedUntil - Date.now()) / 1000)}s remaining) — returning empty for ${endpoint}`);
    const empty = getEmptyResponse(endpoint || "");
    return NextResponse.json(empty);
  }

  // 3. Fetch from Spotify
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
          console.warn("[Spotify API] Audio features unavailable — returning empty array");
          result = [];
        }
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    // Cache successful response
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Spotify API] Error:", err);

    // Token expired — tell client to refresh
    if (err instanceof Error && err.message.includes("401")) {
      return NextResponse.json({ error: "Token expired", code: "TOKEN_EXPIRED" }, { status: 401 });
    }

    // Rate limited — activate backoff, return empty data so dashboard still renders
    if (err instanceof Error && err.message.includes("429")) {
      rateLimitedUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
      console.warn(`[Spotify] Rate limited! Backing off for ${RATE_LIMIT_BACKOFF_MS / 1000}s. No more Spotify calls until ${new Date(rateLimitedUntil).toISOString()}`);
      const empty = getEmptyResponse(endpoint || "");
      setCache(cacheKey, empty, RATE_LIMIT_BACKOFF_MS); // cache the empty response during backoff
      return NextResponse.json(empty);
    }

    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}
