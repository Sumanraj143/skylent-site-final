import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import {
  createVerificationToken,
  isValidEmail,
  normalizeEmail,
  sendVerificationEmail,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const normalizedEmail = normalizeEmail(email);

    if (!name?.trim() || !normalizedEmail || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("skylent");

    const existingUser = await db.collection("users").findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 }
      );
    }

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json(
        { success: false, message: "Email verification is not configured yet." },
        { status: 503 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verification = createVerificationToken();

    const result = await db.collection("users").insertOne({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpiresAt: verification.expiresAt,
      authProvider: "password",
      createdAt: new Date(),
    });

    try {
      await sendVerificationEmail({ email: normalizedEmail, token: verification.token });
    } catch (error) {
      await db.collection("users").deleteOne({ _id: result.insertedId });
      throw error;
    }

    const response = NextResponse.json({
      success: true,
      message: "Account created. Check your email to verify your account.",
      userId: result.insertedId.toString(),
    });

    response.cookies.set("skylent_registered", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;

  } catch (error) {
    console.error("USER CREATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      { status: 500 }
    );
  }
}