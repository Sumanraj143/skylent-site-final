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
  const projectId = toId(body.projectId);
  const studentId = projectId ? null : toId(body.studentId);
  const name = String(body.name ?? "").trim().slice(0, 150);
  const size = Number(body.size);
  const slot = body.slot === "interview" && projectId ? "interview" : "zip";

  if ((!projectId && !studentId) || !name) return NextResponse.json({ success: false, message: "Project and file are required." }, { status: 400 });
  const ext = slot === "interview" ? ".pdf" : ".zip";
  if (!name.toLowerCase().endsWith(ext)) {
    return NextResponse.json({ success: false, message: `Please upload a ${ext} file.` }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_BYTES) {
    return NextResponse.json({ success: false, message: "The file must be smaller than 50 MB. Remove node_modules / venv folders and try again." }, { status: 400 });
  }

  const { users, projects, files } = await collections();
  const owner = projectId
    ? await projects.findOne({ _id: projectId }, { projection: { _id: 1 } })
    : await users.findOne({ _id: studentId! }, { projection: { _id: 1 } });
  if (!owner) return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });

  const result = await files.insertOne({
    projectId,
    studentId,
    slot,
    name,
    size,
    chunks: Math.ceil(size / CHUNK_BYTES),
    status: "uploading",
    createdAt: new Date(),
  } as never);
  return NextResponse.json({ success: true, fileId: result.insertedId.toString(), chunkSize: CHUNK_BYTES });
}
