import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createLinkToken, getAppUrl, isValidEmail, normalizeEmail } from "@/lib/auth";
import { escapeHtml, sendEmail } from "@/lib/email";
import type { UserDoc } from "@/lib/types";

const GENERIC = "If an account exists with this email, a password reset link has been sent.";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection<UserDoc>("users");
    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ success: true, message: GENERIC });

    const reset = createLinkToken(60);
    await users.updateOne(
      { _id: user._id },
      { $set: { passwordResetTokenHash: reset.tokenHash, passwordResetExpiresAt: reset.expiresAt, updatedAt: new Date() } }
    );

    const link = `${getAppUrl()}/reset-password?token=${reset.token}`;
    const sent = await sendEmail({
      to: email,
      subject: "Reset your SKYLENT password",
      html: `<p>Hello ${escapeHtml(user.name || "there")},</p>
        <p>We received a request to reset your SKYLENT password.</p>
        <p><a href="${link}">Create a new password</a></p>
        <p>This link expires in one hour. If you didn't ask for this, you can ignore this email.</p>
        <p>— SKYLENT</p>`,
    });

    if (!sent.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "We couldn't send the reset email right now. Please contact your SKYLENT workshop admin to reset your password.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ success: true, message: GENERIC });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
