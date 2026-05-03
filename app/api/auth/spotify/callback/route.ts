import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Check for errors from Spotify
  if (error) {
    console.error("[Spotify Callback] Error from Spotify:", error);
    return NextResponse.redirect(
      `${appUrl}/?error=spotify_denied`
    );
  }

  // Validate state
  const storedState = request.cookies.get("spotify_auth_state")?.value;
  if (!state || state !== storedState) {
    console.error("[Spotify Callback] State mismatch");
    return NextResponse.redirect(
      `${appUrl}/?error=state_mismatch`
    );
  }

  if (!code) {
    console.error("[Spotify Callback] No code received");
    return NextResponse.redirect(
      `${appUrl}/?error=no_code`
    );
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Create redirect response to dashboard
    const response = NextResponse.redirect(`${appUrl}/dashboard`);

    // Store tokens in secure HTTP-only cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("spotify_access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in, // Usually 3600 seconds (1 hour)
    });

    response.cookies.set("spotify_refresh_token", tokens.refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set("spotify_token_expires", String(Date.now() + tokens.expires_in * 1000), {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });

    // Clear the state cookie
    response.cookies.delete("spotify_auth_state");

    return response;
  } catch (err) {
    console.error("[Spotify Callback] Token exchange error:", err);
    return NextResponse.redirect(
      `${appUrl}/?error=token_exchange_failed`
    );
  }
}
