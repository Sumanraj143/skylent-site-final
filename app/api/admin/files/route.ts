import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/session";
import { collections, toId } from "@/lib/data";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const CHUNK_BYTES = 2 * 1024 * 1024; // 2 MB pieces (stays under Vercel's 4.5 MB request limit)

/** Step 1 of an upload: create an empty file record for a student. */
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Admins only." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const studentId = toId(body.studentId);
  const name = String(body.name ?? "").trim().slice(0, 150);
  const size = Number(body.size);

  if (!studentId || !name) return NextResponse.json({ success: false, message: "Student and file are required." }, { status: 400 });
  if (!name.toLowerCase().endsWith(".zip")) {
    return NextResponse.json({ success: false, message: "Please upload a .zip file (or choose a folder)." }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_BYTES) {
    return NextResponse.json({ success: false, message: "The file must be smaller than 50 MB. Remove node_modules / venv folders and try again." }, { status: 400 });
  }

  const { users, files } = await collections();
  if (!(await users.findOne({ _id: studentId }, { projection: { _id: 1 } }))) {
    return NextResponse.json({ success: false, message: "Student not found." }, { status: 404 });
  }

  const result = await files.insertOne({
    studentId,
    name,
    size,
    chunks: Math.ceil(size / CHUNK_BYTES),
    status: "uploading",
    createdAt: new Date(),
  } as never);
  return NextResponse.json({ success: true, fileId: result.insertedId.toString(), chunkSize: CHUNK_BYTES });
}
