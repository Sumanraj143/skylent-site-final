import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.redirect(new URL("/login?verified=invalid", request.url));
  }

  try {
    const client = await clientPromise;
    const users = client.db("skylent").collection("users");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const result = await users.updateOne(
      {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { $gt: new Date() },
        emailVerified: false,
      },
      {
        $set: { emailVerified: true },
        $unset: {
          emailVerificationTokenHash: "",
          emailVerificationExpiresAt: "",
        },
      }
    );

    return NextResponse.redirect(
      new URL(`/login?verified=${result.modifiedCount ? "success" : "invalid"}`, request.url)
    );
  } catch (error) {
    console.error("EMAIL VERIFICATION ERROR:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.redirect(new URL("/login?verified=error", request.url));
  }
}