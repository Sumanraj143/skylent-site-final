import "server-only";
import { ObjectId } from "mongodb";
export { ObjectId };
import { getDb } from "./db";
import type { BatchDoc, FileChunkDoc, FileDoc, PlanDay, ProjectDoc, UserDoc } from "./types";
import { DEFAULT_PLAN } from "./workshop";

export function toId(value: unknown) {
  const s = String(value ?? "");
  return ObjectId.isValid(s) && s.length === 24 ? new ObjectId(s) : null;
}

export async function collections() {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    projects: db.collection<ProjectDoc>("projects"),
    batches: db.collection<BatchDoc>("batches"),
    settings: db.collection<{ _id: string; days?: PlanDay[]; updatedAt?: Date }>("settings"),
    files: db.collection<FileDoc>("files"),
    chunks: db.collection<FileChunkDoc>("file_chunks"),
  };
}

/** Remove a stored file and all its pieces. */
export async function deleteStoredFile(fileId: ObjectId | null | undefined) {
  if (!fileId) return;
  const { files, chunks } = await collections();
  await chunks.deleteMany({ fileId });
  await files.deleteOne({ _id: fileId });
}

export function formatBytes(n = 0) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export async function getPlan(): Promise<PlanDay[]> {
  const { settings } = await collections();
  const doc = await settings.findOne({ _id: "workshop-plan" });
  return doc?.days?.length ? doc.days : DEFAULT_PLAN;
}
