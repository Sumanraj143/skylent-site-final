import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashToken } from "@/lib/auth";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.redirect(new URL("/login?verified=invalid", request.url));

  try {
    const db = await getDb();
    const result = await db.collection("users").updateOne(
      { emailVerificationTokenHash: hashToken(token), emailVerificationExpiresAt: { $gt: new Date() } },
      { $set: { emailVerified: true }, $unset: { emailVerificationTokenHash: "", emailVerificationExpiresAt: "" } }
    );
    return NextResponse.redirect(new URL(`/login?verified=${result.modifiedCount ? "success" : "invalid"}`, request.url));
  } catch (error) {
    console.error("EMAIL VERIFICATION ERROR:", error);
    return NextResponse.redirect(new URL("/login?verified=error", request.url));
  }
}
