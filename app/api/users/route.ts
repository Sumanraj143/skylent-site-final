import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MongoServerError } from "mongodb";
import { getDb } from "@/lib/db";
import { createLinkToken, getAppUrl, isValidEmail, MIN_PASSWORD_LENGTH, normalizeEmail } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

/** Public sign-up. Workshop students are normally created by the admin instead. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Name, email and password are required." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection("users");

    if (await users.findOne({ email })) {
      return NextResponse.json(
        { success: false, message: "This email is already registered. Please sign in instead." },
        { status: 409 }
      );
    }

    const verification = createLinkToken(60 * 24);
    await users.insertOne({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "member",
      authProvider: "password",
      emailVerified: false,
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpiresAt: verification.expiresAt,
      sessionVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Email is best-effort: if it fails, the account still works.
    const link = `${getAppUrl()}/api/users/verify?token=${verification.token}`;
    const sent = await sendEmail({
      to: email,
      subject: "Verify your SKYLENT account",
      html: `<p>Welcome to SKYLENT.</p><p><a href="${link}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
    });

    return NextResponse.json({
      success: true,
      message: sent.ok
        ? "Account created. You can sign in now. We also sent a verification link to your email."
        : "Account created. You can sign in now.",
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This email is already registered. Please sign in instead." },
        { status: 409 }
      );
    }
    console.error("SIGNUP ERROR:", error);
    return NextResponse.json({ success: false, message: "Could not create your account right now. Please try again." }, { status: 500 });
  }
}
