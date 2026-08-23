import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("skylent_google_state")?.value;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/login?google=invalid", request.url));
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.id_token) throw new Error("Google token exchange failed");

    const { payload } = await jwtVerify(tokens.id_token, googleKeys, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    if (!payload.email || payload.email_verified !== true || !payload.sub) {
      throw new Error("Google identity is not verified");
    }

    const client = await clientPromise;
    const users = client.db("skylent").collection("users");
    const email = payload.email.toLowerCase();
    const user = await users.findOneAndUpdate(
      { email },
      {
        $set: {
          emailVerified: true,
          googleId: payload.sub,
          authProvider: "google",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          name: payload.name || email.split("@")[0],
          email,
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("skylent_session", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete("skylent_google_state");
    return response;
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.redirect(new URL("/login?google=failed", request.url));
  }
}