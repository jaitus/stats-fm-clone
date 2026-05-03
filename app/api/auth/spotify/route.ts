import { NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/lib/spotify";

export async function GET() {
  // Generate a random state for CSRF protection
  const state = crypto.randomUUID();

  const authUrl = getSpotifyAuthUrl(state);

  // Create response that redirects to Spotify
  const response = NextResponse.redirect(authUrl);

  // Store state in cookie for validation on callback
  response.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
