import { NextResponse } from "next/server";
import { Binary } from "mongodb";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/session";
import { collections, deleteStoredFile, toId } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };
const CHUNK_LIMIT = 2 * 1024 * 1024 + 1024;

/** Step 2: send one piece of the file. ?n=0,1,2… */
export async function PUT(request: Request, { params }: Ctx) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Admins only." }, { status: 403 });
  const fileId = toId((await params).id);
  const n = Number(new URL(request.url).searchParams.get("n"));
  if (!fileId || !Number.isInteger(n) || n < 0) return NextResponse.json({ success: false, message: "Bad request." }, { status: 400 });

  const { files, chunks } = await collections();
  const file = await files.findOne({ _id: fileId });
  if (!file || file.status !== "uploading" || n >= file.chunks) {
    return NextResponse.json({ success: false, message: "Upload not found." }, { status: 404 });
  }

  const data = Buffer.from(await request.arrayBuffer());
  if (!data.length || data.length > CHUNK_LIMIT) return NextResponse.json({ success: false, message: "Piece too large." }, { status: 413 });

  await chunks.updateOne({ fileId, n }, { $set: { fileId, n, data: new Binary(data) } }, { upsert: true });
  return NextResponse.json({ success: true });
}

/** Step 3: finish. Checks every piece arrived, then gives the file to the student. */
export async function POST(_request: Request, { params }: Ctx) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Admins only." }, { status: 403 });
  const fileId = toId((await params).id);
  if (!fileId) return NextResponse.json({ success: false, message: "Bad request." }, { status: 400 });

  const { files, chunks, users, projects } = await collections();
  const file = await files.findOne({ _id: fileId });
  if (!file) return NextResponse.json({ success: false, message: "Upload not found." }, { status: 404 });

  const received = await chunks.countDocuments({ fileId });
  if (received !== file.chunks) {
    return NextResponse.json({ success: false, message: "Some parts of the file are missing. Please upload again." }, { status: 400 });
  }

  if (file.projectId) {
    const project = await projects.findOne({ _id: file.projectId });
    if (!project) {
      await deleteStoredFile(fileId);
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });
    }
    await files.updateOne({ _id: fileId }, { $set: { status: "ready" } });
    const isPdf = file.slot === "interview";
    const previous = isPdf ? project.interviewFileId : project.fileId;
    await projects.updateOne(
      { _id: project._id },
      {
        $set: isPdf
          ? { interviewFileId: fileId, interviewFileName: file.name, interviewFileSize: file.size, updatedAt: new Date() }
          : { fileId, fileName: file.name, fileSize: file.size, updatedAt: new Date() },
      }
    );
    if (previous && !previous.equals(fileId)) await deleteStoredFile(previous);
    revalidatePath("/admin", "layout");
    revalidatePath("/dashboard");
    return NextResponse.json({ success: true });
  }

  const student = file.studentId ? await users.findOne({ _id: file.studentId }) : null;
  if (!student) {
    await deleteStoredFile(fileId);
    return NextResponse.json({ success: false, message: "Student not found." }, { status: 404 });
  }

  await files.updateOne({ _id: fileId }, { $set: { status: "ready" } });
  await users.updateOne(
    { _id: student._id },
    { $set: { fileId, fileName: file.name, fileSize: file.size, fileUploadedAt: new Date(), updatedAt: new Date() } }
  );
  // Replace: remove the student's previous file
  if (student.fileId && !student.fileId.equals(fileId)) await deleteStoredFile(student.fileId);

  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
  return NextResponse.json({ success: true });
}

/** Remove a student's file. */
export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await getAdmin())) return NextResponse.json({ success: false, message: "Admins only." }, { status: 403 });
  const fileId = toId((await params).id);
  if (!fileId) return NextResponse.json({ success: false, message: "Bad request." }, { status: 400 });

  const { users, projects } = await collections();
  await users.updateMany({ fileId }, { $set: { fileId: null, fileName: "", fileSize: 0, fileUploadedAt: null } });
  await projects.updateMany({ fileId }, { $set: { fileId: null, fileName: "", fileSize: 0 } });
  await projects.updateMany({ interviewFileId: fileId }, { $set: { interviewFileId: null, interviewFileName: "", interviewFileSize: 0 } });
  await deleteStoredFile(fileId);
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard");
  return NextResponse.json({ success: true });
}
