import { createHash, randomBytes } from "node:crypto";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value) {
  return emailPattern.test(normalizeEmail(value));
}

export function createVerificationToken() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
}

export async function sendVerificationEmail({ email, token }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Email verification is not configured");

  const verificationUrl = `${getAppUrl()}/api/users/verify?token=${token}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Verify your SKYLENT account",
      html: `<p>Welcome to SKYLENT.</p><p><a href="${verificationUrl}">Verify your email address</a></p><p>This link expires in one hour.</p>`,
    }),
  });
  if (!response.ok) throw new Error("Verification email could not be sent");
}