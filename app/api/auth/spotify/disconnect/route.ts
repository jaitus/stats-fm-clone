import { NextResponse } from "next/server";

export async function POST() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = NextResponse.redirect(`${appUrl}/`);

  // Clear all Spotify cookies
  response.cookies.delete("spotify_access_token");
  response.cookies.delete("spotify_refresh_token");
  response.cookies.delete("spotify_token_expires");

  return response;
}
