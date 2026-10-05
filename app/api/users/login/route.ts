import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/auth";
import { createSessionToken, homeFor, roleOf, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import type { UserDoc } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");

    if (!email || !password || !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Enter your email and password." }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection<UserDoc>("users").findOne({ email });
    const ok = user?.password ? await bcrypt.compare(password, user.password) : false;

    if (!user || !ok) {
      const googleOnly = user && !user.password;
      return NextResponse.json(
        {
          success: false,
          message: googleOnly
            ? "This account uses Google sign-in. Click “Continue with Google”."
            : "Email or password is incorrect.",
        },
        { status: 401 }
      );
    }

    const role = roleOf(user);
    const redirectTo = user.mustChangePassword ? "/account/password" : homeFor(role);
    const response = NextResponse.json({ success: true, redirect: redirectTo });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user), sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ success: false, message: "Sign in failed. Please try again." }, { status: 500 });
  }
}
