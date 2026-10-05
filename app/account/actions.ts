"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser, createSessionToken, homeFor, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { collections } from "@/lib/data";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth";

export async function changePassword(_prev: { error?: string; done?: string } | null, formData: FormData) {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < MIN_PASSWORD_LENGTH) return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (next !== confirm) return { error: "The two new passwords don't match." };
  if (user.password && !(await bcrypt.compare(current, user.password))) return { error: "Your current password is incorrect." };

  const { users } = await collections();
  const sessionVersion = (user.sessionVersion ?? 0) + 1;
  await users.updateOne(
    { _id: user._id },
    { $set: { password: await bcrypt.hash(next, 10), mustChangePassword: false, sessionVersion, updatedAt: new Date() } }
  );
  // Other devices are signed out; keep this one signed in.
  (await cookies()).set(SESSION_COOKIE, await createSessionToken({ _id: user._id, sessionVersion }), sessionCookieOptions);
  return { done: homeFor(user.role) };
}

export async function setVideoConsent(formData: FormData) {
  const user = await requireUser();
  const agree = formData.get("agree") === "yes";
  const { users } = await collections();
  await users.updateOne({ _id: user._id }, { $set: { videoConsent: agree, videoConsentAt: new Date(), updatedAt: new Date() } });
  revalidatePath("/dashboard");
}
