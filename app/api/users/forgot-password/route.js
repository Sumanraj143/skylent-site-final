import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  createVerificationToken,
  isValidEmail,
  normalizeEmail,
  getAppUrl,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const users = client.db("skylent").collection("users");

    const user = await users.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const resetToken = createVerificationToken();

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetTokenHash: resetToken.tokenHash,
          passwordResetExpiresAt: resetToken.expiresAt,
          updatedAt: new Date(),
        },
      }
    );

    const resetUrl = `${getAppUrl()}/reset-password?token=${resetToken.token}`;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      throw new Error("Email service is not configured");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [normalizedEmail],
        subject: "Reset your SKYLENT password",
        html: `
          <p>Hello ${user.name || "there"},</p>
          <p>We received a request to reset your SKYLENT password.</p>
          <p>
            <a href="${resetUrl}">
              Create a new password
            </a>
          </p>
          <p>This link expires in one hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>— SKYLENT</p>
        `,
      }),
    });

if (!response.ok) {
  const resendError = await response.text();

  console.error("RESEND ERROR:", resendError);

  throw new Error("Password reset email could not be sent");
}

    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error instanceof Error ? error.message : "unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}