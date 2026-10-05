import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { getDb } from "./db";
import type { Role, UserDoc } from "./types";

export const SESSION_COOKIE = "skylent_session";
const SESSION_DAYS = 30;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set (at least 32 characters) in production.");
    }
    return new TextEncoder().encode("dev-only-secret-change-me-dev-only-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

/** Admins are decided by the ADMIN_EMAILS environment variable (comma separated). */
export function isAdminEmail(email: string) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export function roleOf(user: Pick<UserDoc, "email" | "role">): Role {
  if (isAdminEmail(user.email)) return "admin";
  return user.role === "student" ? "student" : "member";
}

export function homeFor(role: Role) {
  return role === "admin" ? "/admin" : role === "student" ? "/dashboard" : "/";
}

export async function createSessionToken(user: Pick<UserDoc, "_id" | "sessionVersion">) {
  return new SignJWT({ sv: user.sessionVersion ?? 0 })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user._id.toString())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * SESSION_DAYS,
};

async function readToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (!payload.sub || !ObjectId.isValid(payload.sub)) return null;
    return { userId: payload.sub, sv: Number(payload.sv ?? 0) };
  } catch {
    return null; // expired, tampered, or an old unsigned cookie
  }
}

/** Current logged-in user (fresh from the database), or null. Cached per request. */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const claims = await readToken(store.get(SESSION_COOKIE)?.value);
  if (!claims) return null;

  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOne({ _id: new ObjectId(claims.userId) });
  if (!user) return null;
  // Changing/resetting a password bumps sessionVersion, which logs out old sessions.
  if ((user.sessionVersion ?? 0) !== claims.sv) return null;

  return { ...user, role: roleOf(user) } as UserDoc & { role: Role };
});

/** Fast check without the database — only for showing the right nav button. */
export async function hasSession() {
  const store = await cookies();
  return Boolean(await readToken(store.get(SESSION_COOKIE)?.value));
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect(homeFor(user.role));
  return user;
}
