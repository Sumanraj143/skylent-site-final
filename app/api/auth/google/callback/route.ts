import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { getAppUrl } from "@/lib/auth";
import { createSessionToken, homeFor, roleOf, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import type { UserDoc } from "@/lib/types";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("skylent_google_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/login?google=invalid", request.url));
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${getAppUrl()}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.id_token) throw new Error("Google token exchange failed");

    const { payload } = await jwtVerify(tokens.id_token, googleKeys, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    if (typeof payload.email !== "string" || payload.email_verified !== true || !payload.sub) {
      throw new Error("Google identity is not verified");
    }

    const db = await getDb();
    const users = db.collection<UserDoc>("users");
    const email = payload.email.toLowerCase();
    const now = new Date();

    // Google has verified this email, so it is safe to link to an existing account with the same email.
    const user = await users.findOneAndUpdate(
      { email },
      {
        $set: { emailVerified: true, googleId: payload.sub, mustChangePassword: false, updatedAt: now },
        $setOnInsert: {
          name: typeof payload.name === "string" ? payload.name : email.split("@")[0],
          email,
          role: "member",
          authProvider: "google",
          sessionVersion: 0,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    if (!user) throw new Error("Could not load user after Google sign-in");

    const response = NextResponse.redirect(new URL(homeFor(roleOf(user)), request.url));
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user), sessionCookieOptions);
    response.cookies.delete("skylent_google_state");
    return response;
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.redirect(new URL("/login?google=failed", request.url));
  }
}
