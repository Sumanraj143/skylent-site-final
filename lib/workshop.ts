import type { BatchDoc, PlanDay, UserDoc } from "./types";

export const WORKSHOP_DAYS = 4;
export const COMPLETED = 5;

export const DEFAULT_PLAN: PlanDay[] = [
  {
    day: 1,
    title: "Seminar: understand the technology",
    summary: "What AI agents are, where they are used, and how a real agent is put together.",
    items: [
      "What is an AI agent? Model, tools, memory and the agent loop",
      "Real examples of useful agents",
      "How the SKYLENT projects are structured",
      "Setup: Node.js / Python, VS Code, API keys",
    ],
  },
  {
    day: 2,
    title: "Lab: see the system working",
    summary: "Run a working agent together and change it step by step.",
    items: [
      "Run a sample agent on your own laptop",
      "Read the code: where the prompt, tools and loop live",
      "Make a small change and see the result",
      "Common errors and how to fix them",
    ],
  },
  {
    day: 3,
    title: "Build: your own AI agent",
    summary: "You get your own project. Run it, understand it, and prepare your seminar.",
    items: [
      "Download your project and run it",
      "Understand the architecture and each file",
      "Prepare your seminar: problem, solution, demo, learnings",
      "Practise your demo with your team",
    ],
  },
  {
    day: 4,
    title: "Explain: present your seminar",
    summary: "Present your project and get your interview stack.",
    items: [
      "Present your seminar and live demo",
      "Q&A practice",
      "Collect your interview stack",
      "Seminar recording for SKYLENT YouTube and Instagram",
    ],
  },
];

export type StudentAccess = {
  paid: boolean;
  hasBatch: boolean;
  unlockedDay: number; // 0–5
  completed: boolean;
  canSeeDay: (day: number) => boolean;
  canSeeProject: boolean;
  canSeeInterview: boolean;
};

/**
 * Rules:
 * - Nothing opens until the student is marked paid and added to a workshop batch.
 * - Days open as the admin unlocks them for the batch.
 * - Day 3 opens the student's own project (code + setup + docs).
 * - Day 4 opens the interview stack.
 * - After the workshop, everything stays open forever.
 */
export function studentAccess(user: Pick<UserDoc, "paid" | "batchId">, batch: Pick<BatchDoc, "unlockedDay"> | null): StudentAccess {
  const paid = Boolean(user.paid);
  const hasBatch = Boolean(user.batchId && batch);
  const unlockedDay = paid && hasBatch ? Math.max(0, Math.min(COMPLETED, batch!.unlockedDay || 0)) : 0;
  return {
    paid,
    hasBatch,
    unlockedDay,
    completed: unlockedDay >= COMPLETED,
    canSeeDay: (day) => unlockedDay >= day,
    canSeeProject: unlockedDay >= 3,
    canSeeInterview: unlockedDay >= 4,
  };
}

export function batchStatusLabel(unlockedDay: number) {
  if (!unlockedDay) return "Not started";
  if (unlockedDay >= COMPLETED) return "Completed";
  return `Day ${unlockedDay} open`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** Parse "Q: ... / A: ..." blocks from a textarea. Blank lines separate questions. */
export function parseInterview(text: string) {
  const out: { q: string; a: string }[] = [];
  let current: { q: string; a: string } | null = null;
  let mode: "q" | "a" = "q";
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    const qMatch = line.match(/^q[:.)\-]\s*(.*)$/i);
    const aMatch = line.match(/^a[:.)\-]\s*(.*)$/i);
    if (qMatch) {
      if (current && current.q) out.push(current);
      current = { q: qMatch[1], a: "" };
      mode = "q";
    } else if (aMatch && current) {
      current.a = current.a ? `${current.a}\n${aMatch[1]}` : aMatch[1];
      mode = "a";
    } else if (line && current) {
      if (mode === "q") current.q += ` ${line}`;
      else current.a += `\n${line}`;
    }
  }
  if (current && current.q) out.push(current);
  return out.map((x) => ({ q: x.q.trim(), a: x.a.trim() }));
}

export function interviewToText(items: { q: string; a: string }[] = []) {
  return items.map((x) => `Q: ${x.q}\nA: ${x.a}`).join("\n\n");
}

export function lines(text: string) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function safeUrl(value: string) {
  const v = value.trim();
  if (!v) return "";
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}
