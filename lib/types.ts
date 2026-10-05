import type { ObjectId } from "mongodb";

export type Role = "admin" | "student" | "member";

export type UserDoc = {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string;
  role?: Role;
  authProvider?: "password" | "google";
  googleId?: string;
  emailVerified?: boolean;
  mustChangePassword?: boolean;
  sessionVersion?: number;
  // Workshop fields (students)
  batchId?: ObjectId | null;
  projectId?: ObjectId | null;
  paid?: boolean;
  paidAt?: Date | null;
  phone?: string;
  videoConsent?: boolean;
  videoConsentAt?: Date | null;
  youtubeUrl?: string;
  instagramUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type InterviewQA = { q: string; a: string };

export type ProjectDoc = {
  _id: ObjectId;
  title: string;
  slug: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  problem: string;
  howItWorks: string;
  techStack: string[];
  setupSteps: string[];
  zipUrl: string;
  docsUrl: string;
  demoUrl: string;
  interview: InterviewQA[];
  seminarTips: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
};

export type BatchDoc = {
  _id: ObjectId;
  name: string;
  college: string;
  startDate: string; // YYYY-MM-DD
  /** 0 = not started, 1–4 = that day is open, 5 = workshop completed */
  unlockedDay: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PlanDay = {
  day: number;
  title: string;
  summary: string;
  items: string[];
};
