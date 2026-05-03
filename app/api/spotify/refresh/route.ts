import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("spotify_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);

    const response = NextResponse.json({ success: true });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("spotify_access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in,
    });

    if (tokens.refresh_token) {
      response.cookies.set("spotify_refresh_token", tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    response.cookies.set("spotify_token_expires", String(Date.now() + tokens.expires_in * 1000), {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    console.error("[Spotify Refresh] Error:", err);
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
