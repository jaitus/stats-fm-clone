import { NextRequest, NextResponse } from "next/server";
import {
  getUserProfile,
  getTopTracks,
  getTopArtists,
  getRecentlyPlayed,
  getAudioFeatures,
  type TimeRange,
} from "@/lib/spotify";
import {
  DEMO_PROFILE,
  DEMO_TRACKS,
  DEMO_ARTISTS,
  DEMO_RECENTLY_PLAYED,
  DEMO_AUDIO_FEATURES,
} from "@/lib/demo-data";

// ─── In-memory cache to prevent Spotify rate limiting ────────────────────────
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const RATE_LIMIT_BACKOFF_MS = 30 * 60 * 1000; // 30 minutes backoff on 429

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

// Demo data responses
function getDemoResponse(endpoint: string | null): unknown {
  switch (endpoint) {
    case "profile": return DEMO_PROFILE;
    case "top-tracks": return DEMO_TRACKS;
    case "top-artists": return DEMO_ARTISTS;
    case "recently-played": return DEMO_RECENTLY_PLAYED;
    case "audio-features": return DEMO_AUDIO_FEATURES;
    default: return null;
  }
}

// Empty fallback responses
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
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get("endpoint");
  const timeRange = (searchParams.get("time_range") || "medium_term") as TimeRange;
  const isDemo = searchParams.get("demo") === "true";

  // ─── Demo Mode: serve mock data when no auth or explicitly requested ───
  if (!accessToken || isDemo) {
    const demo = getDemoResponse(endpoint);
    if (demo) return NextResponse.json(demo);
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  // ─── Cache check ───────────────────────────────────────────────────────
  const cacheKey = `${endpoint}:${timeRange}:${searchParams.get("ids")?.slice(0, 20) || ""}`;
  const cached = getCached(cacheKey);
  if (cached !== null) {
    return NextResponse.json(cached);
  }

  // ─── Rate limit backoff ────────────────────────────────────────────────
  if (Date.now() < rateLimitedUntil) {
    // Return demo data during backoff
    const demo = getDemoResponse(endpoint);
    return NextResponse.json(demo || getEmptyResponse(endpoint || ""));
  }

  // ─── Fetch from Spotify ────────────────────────────────────────────────
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
          console.warn("[Spotify API] Audio features unavailable — returning demo data");
          result = DEMO_AUDIO_FEATURES;
        }
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Spotify API] Error:", err);

    if (err instanceof Error && err.message.includes("401")) {
      return NextResponse.json({ error: "Token expired", code: "TOKEN_EXPIRED" }, { status: 401 });
    }

    // Rate limited — serve demo data instead of empty data
    if (err instanceof Error && err.message.includes("429")) {
      rateLimitedUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
      console.warn(`[Spotify] Rate limited! Serving demo data. Backoff until ${new Date(rateLimitedUntil).toISOString()}`);
      const demo = getDemoResponse(endpoint);
      if (demo) {
        setCache(cacheKey, demo, RATE_LIMIT_BACKOFF_MS);
        return NextResponse.json(demo);
      }
    }

    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}
