import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "./db";
import type { BatchDoc, PlanDay, ProjectDoc, UserDoc } from "./types";
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
  };
}

export async function getPlan(): Promise<PlanDay[]> {
  const { settings } = await collections();
  const doc = await settings.findOne({ _id: "workshop-plan" });
  return doc?.days?.length ? doc.days : DEFAULT_PLAN;
}
