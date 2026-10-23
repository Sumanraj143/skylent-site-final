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
  // Project files uploaded by the admin for this student
  fileId?: ObjectId | null;
  fileName?: string;
  fileSize?: number;
  fileUploadedAt?: Date | null;
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

export type FileDoc = {
  _id: ObjectId;
  studentId: ObjectId;
  name: string;
  size: number;
  chunks: number;
  status: "uploading" | "ready";
  createdAt: Date;
};

export type FileChunkDoc = {
  _id?: ObjectId;
  fileId: ObjectId;
  n: number;
  data: import("mongodb").Binary;
};
