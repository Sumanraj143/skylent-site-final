import { createHash, randomBytes, randomInt } from "node:crypto";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(value: unknown) {
  return emailPattern.test(normalizeEmail(value));
}

/** A random token for email links. Only the hash is stored in the database. */
export function createLinkToken(ttlMinutes = 60) {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
  };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Easy-to-read temporary password, e.g. "sky-7KQ4-M9TP". No confusing characters (0/O, 1/I). */
export function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) => Array.from({ length: n }, () => chars[randomInt(chars.length)]).join("");
  return `sky-${pick(4)}-${pick(4)}`;
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).replace(/\/$/, "");
}

export const MIN_PASSWORD_LENGTH = 8;
