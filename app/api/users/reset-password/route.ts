import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { hashToken, MIN_PASSWORD_LENGTH } from "@/lib/auth";
import type { UserDoc } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");

    if (!/^[a-f0-9]{64}$/.test(token) || !password) {
      return NextResponse.json({ success: false, message: "Reset link and new password are required." }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection<UserDoc>("users");
    const user = await users.findOne({ passwordResetTokenHash: hashToken(token), passwordResetExpiresAt: { $gt: new Date() } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: { password: await bcrypt.hash(password, 10), mustChangePassword: false, updatedAt: new Date() },
        $inc: { sessionVersion: 1 },
        $unset: { passwordResetTokenHash: "", passwordResetExpiresAt: "" },
      }
    );
    return NextResponse.json({ success: true, message: "Password reset successfully. You can sign in now." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
