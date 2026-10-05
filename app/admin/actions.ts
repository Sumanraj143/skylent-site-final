"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail, requireAdmin } from "@/lib/session";
import { collections, toId } from "@/lib/data";
import { generateTempPassword, getAppUrl, isValidEmail, normalizeEmail } from "@/lib/auth";
import { escapeHtml, sendEmail } from "@/lib/email";
import { COMPLETED, lines, parseInterview, safeUrl, slugify } from "@/lib/workshop";
import type { PlanDay, ProjectDoc } from "@/lib/types";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const checked = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

/* ───────────── Projects ───────────── */

export async function saveProject(formData: FormData) {
  await requireAdmin();
  const { projects } = await collections();
  const id = toId(formData.get("id"));
  const title = text(formData, "title");
  if (!title) throw new Error("Project title is required.");

  const difficulty = text(formData, "difficulty");
  const data = {
    title,
    category: text(formData, "category"),
    difficulty: (["Beginner", "Intermediate", "Advanced"].includes(difficulty) ? difficulty : "Beginner") as ProjectDoc["difficulty"],
    summary: text(formData, "summary"),
    problem: text(formData, "problem"),
    howItWorks: text(formData, "howItWorks"),
    techStack: text(formData, "techStack").split(",").map((t) => t.trim()).filter(Boolean),
    setupSteps: lines(text(formData, "setupSteps")),
    zipUrl: safeUrl(text(formData, "zipUrl")),
    docsUrl: safeUrl(text(formData, "docsUrl")),
    demoUrl: safeUrl(text(formData, "demoUrl")),
    interview: parseInterview(text(formData, "interview")),
    seminarTips: text(formData, "seminarTips"),
    status: (text(formData, "status") === "published" ? "published" : "draft") as ProjectDoc["status"],
    updatedAt: new Date(),
  };

  if (id) {
    await projects.updateOne({ _id: id }, { $set: data });
  } else {
    // Make a unique slug: "resume-screener", "resume-screener-2", ...
    const base = slugify(title) || "project";
    let slug = base;
    for (let n = 2; await projects.findOne({ slug }); n++) slug = `${base}-${n}`;
    await projects.insertOne({ ...data, slug, createdAt: new Date() } as ProjectDoc);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/projects?saved=1");
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) return;
  const { projects, users } = await collections();
  await users.updateMany({ projectId: id }, { $set: { projectId: null } });
  await projects.deleteOne({ _id: id });
  revalidatePath("/admin", "layout");
  redirect("/admin/projects?deleted=1");
}

/* ───────────── Batches (one workshop at one college) ───────────── */

export async function saveBatch(formData: FormData) {
  await requireAdmin();
  const { batches } = await collections();
  const id = toId(formData.get("id"));
  const data = {
    name: text(formData, "name"),
    college: text(formData, "college"),
    startDate: text(formData, "startDate"),
    notes: text(formData, "notes"),
    updatedAt: new Date(),
  };
  if (!data.name || !data.college) throw new Error("Workshop name and college are required.");

  if (id) {
    await batches.updateOne({ _id: id }, { $set: data });
    revalidatePath("/admin", "layout");
    redirect(`/admin/batches/${id}`);
  }
  const result = await batches.insertOne({ ...data, unlockedDay: 0, createdAt: new Date() } as never);
  revalidatePath("/admin", "layout");
  redirect(`/admin/batches/${result.insertedId}`);
}

export async function setBatchDay(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  const day = Math.max(0, Math.min(COMPLETED, Number(formData.get("day")) || 0));
  if (!id) return;
  const { batches } = await collections();
  await batches.updateOne({ _id: id }, { $set: { unlockedDay: day, updatedAt: new Date() } });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
}

export async function deleteBatch(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) return;
  const { batches, users } = await collections();
  await users.updateMany({ batchId: id }, { $set: { batchId: null } });
  await batches.deleteOne({ _id: id });
  revalidatePath("/admin", "layout");
  redirect("/admin/batches");
}

/** Give every student in the batch without a project a different published project. */
export async function autoAssignProjects(formData: FormData) {
  await requireAdmin();
  const batchId = toId(formData.get("id"));
  if (!batchId) return;
  const { users, projects } = await collections();

  const pool = await projects.find({ status: "published" }, { projection: { _id: 1 } }).sort({ createdAt: 1 }).toArray();
  if (!pool.length) return;
  const students = await users.find({ batchId, role: "student" }).sort({ name: 1 }).toArray();

  const used = new Set(students.filter((s) => s.projectId).map((s) => s.projectId!.toString()));
  const free = pool.filter((p) => !used.has(p._id.toString()));
  let i = 0;
  for (const s of students) {
    if (s.projectId) continue;
    // Prefer unused projects; if there are more students than projects, start reusing.
    const pick = free.length ? free.shift()! : pool[i++ % pool.length];
    await users.updateOne({ _id: s._id }, { $set: { projectId: pick._id, updatedAt: new Date() } });
  }
  revalidatePath("/admin", "layout");
}

/* ───────────── Students ───────────── */

export type AddStudentsResult = {
  rows: { name: string; email: string; password: string | null; status: string; emailed: boolean }[];
  error?: string;
} | null;

/**
 * Bulk add. One student per line: "Full name, email" (optional third value: phone).
 * New students get a temporary password, shown once to the admin.
 */
export async function addStudents(_prev: AddStudentsResult, formData: FormData): Promise<AddStudentsResult> {
  await requireAdmin();
  const { users } = await collections();
  const batchId = toId(formData.get("batchId"));
  const paid = checked(formData, "paid");
  const notify = checked(formData, "sendEmail");
  const entries = lines(text(formData, "students"));
  if (!entries.length) return { rows: [], error: "Add at least one line: Full name, email" };
  if (entries.length > 300) return { rows: [], error: "Please add at most 300 students at a time." };

  const rows: NonNullable<AddStudentsResult>["rows"] = [];
  for (const entry of entries) {
    const parts = entry.split(/[,\t;]/).map((p) => p.trim());
    const emailIndex = parts.findIndex((p) => isValidEmail(p));
    if (emailIndex === -1) {
      rows.push({ name: parts[0] || entry, email: "", password: null, status: "Skipped: no valid email", emailed: false });
      continue;
    }
    const email = normalizeEmail(parts[emailIndex]);
    if (isAdminEmail(email)) {
      rows.push({ name: parts[0] || email, email, password: null, status: "Skipped: this is an admin account", emailed: false });
      continue;
    }
    if (rows.some((r) => r.email === email)) {
      rows.push({ name: parts[0] || email, email, password: null, status: "Skipped: listed twice", emailed: false });
      continue;
    }
    const others = parts.filter((_, i) => i !== emailIndex);
    const name = others[0] || email.split("@")[0];
    const phone = others[1] || "";
    const now = new Date();
    const workshopFields: Record<string, unknown> = { role: "student", updatedAt: now };
    if (batchId) workshopFields.batchId = batchId;
    if (paid) Object.assign(workshopFields, { paid: true, paidAt: now });
    if (phone) workshopFields.phone = phone;

    const existing = await users.findOne({ email });
    let password: string | null = null;

    if (existing) {
      // An unverified self-signup could be someone else using this student's email.
      // Reset its password so only the real student (with the new password) can get in.
      const unproven = existing.password && !existing.emailVerified && !existing.googleId;
      if (unproven) {
        password = generateTempPassword();
        Object.assign(workshopFields, { password: await bcrypt.hash(password, 10), mustChangePassword: true });
      }
      await users.updateOne({ _id: existing._id }, { $set: workshopFields, ...(unproven ? { $inc: { sessionVersion: 1 } } : {}) });
      rows.push({ name: existing.name || name, email, password, status: unproven ? "Existing account: new password set" : "Existing account: added to workshop", emailed: false });
    } else {
      password = generateTempPassword();
      await users.insertOne({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        authProvider: "password",
        emailVerified: false,
        mustChangePassword: true,
        sessionVersion: 0,
        paid: false,
        projectId: null,
        batchId: null,
        createdAt: now,
        ...workshopFields,
      } as never);
      rows.push({ name, email, password, status: "Created", emailed: false });
    }

    if (notify && password) {
      const sent = await sendEmail({
        to: email,
        subject: "Your SKYLENT student login",
        html: `<p>Hi ${escapeHtml(name)},</p>
          <p>Your SKYLENT workshop account is ready.</p>
          <p>Sign in: <a href="${getAppUrl()}/login">${getAppUrl()}/login</a><br/>
          Email: ${escapeHtml(email)}<br/>Temporary password: <strong>${password}</strong></p>
          <p>You'll be asked to choose your own password the first time you sign in.</p><p>— SKYLENT</p>`,
      });
      rows[rows.length - 1].emailed = sent.ok;
    }
  }
  revalidatePath("/admin", "layout");
  return { rows };
}

export async function updateStudent(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) return;
  const { users } = await collections();
  const current = await users.findOne({ _id: id });
  if (!current) return;

  const paid = checked(formData, "paid");
  const role = text(formData, "role") === "member" ? "member" : "student";
  await users.updateOne(
    { _id: id },
    {
      $set: {
        name: text(formData, "name") || current.name,
        phone: text(formData, "phone"),
        role,
        batchId: toId(formData.get("batchId")),
        projectId: toId(formData.get("projectId")),
        paid,
        paidAt: paid ? current.paidAt ?? new Date() : null,
        youtubeUrl: safeUrl(text(formData, "youtubeUrl")),
        instagramUrl: safeUrl(text(formData, "instagramUrl")),
        updatedAt: new Date(),
      },
    }
  );
  revalidatePath("/admin", "layout");
  redirect(`/admin/students/${id}?saved=1`);
}

export async function togglePaid(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id) return;
  const { users } = await collections();
  const paid = formData.get("paid") === "true";
  await users.updateOne({ _id: id }, { $set: { paid, paidAt: paid ? new Date() : null, updatedAt: new Date() } });
  revalidatePath("/admin", "layout");
}

export async function resetStudentPassword(_prev: { password: string } | null, formData: FormData) {
  const admin = await requireAdmin();
  const id = toId(formData.get("id"));
  if (!id || id.equals(admin._id)) return null;
  const { users } = await collections();
  const password = generateTempPassword();
  await users.updateOne(
    { _id: id },
    {
      $set: { password: await bcrypt.hash(password, 10), mustChangePassword: true, updatedAt: new Date() },
      $inc: { sessionVersion: 1 },
    }
  );
  return { password };
}

/* ───────────── 4-day plan ───────────── */

export async function savePlan(formData: FormData) {
  await requireAdmin();
  const days: PlanDay[] = [1, 2, 3, 4].map((day) => ({
    day,
    title: text(formData, `title-${day}`) || `Day ${day}`,
    summary: text(formData, `summary-${day}`),
    items: lines(text(formData, `items-${day}`)),
  }));
  const { settings } = await collections();
  await settings.updateOne({ _id: "workshop-plan" }, { $set: { days, updatedAt: new Date() } }, { upsert: true });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
  redirect("/admin/plan?saved=1");
}

