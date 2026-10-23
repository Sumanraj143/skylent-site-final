import { NextResponse } from "next/server";
import { getAdmin, getCurrentUser } from "@/lib/session";
import { collections, toId } from "@/lib/data";
import { studentAccess } from "@/lib/workshop";

/**
 * Download a student's project file.
 * Admins can download any file. A student can download only their own file, from Day 3 of their workshop.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const fileId = toId((await params).id);
  if (!fileId) return NextResponse.json({ success: false, message: "File not found." }, { status: 404 });

  const admin = await getAdmin();
  const { files, chunks, batches } = await collections();
  const file = await files.findOne({ _id: fileId, status: "ready" });
  if (!file) return NextResponse.json({ success: false, message: "File not found." }, { status: 404 });

  if (!admin) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    const batch = user.batchId ? await batches.findOne({ _id: user.batchId }) : null;
    const owns = user.fileId?.equals(fileId) && user._id.equals(file.studentId);
    if (!owns || !studentAccess(user, batch).canSeeProject) {
      return NextResponse.json({ success: false, message: "This file is not unlocked for your account yet." }, { status: 403 });
    }
  }

  // Stream the pieces one by one, so large files don't need to fit in memory.
  const cursor = chunks.find({ fileId }).sort({ n: 1 });
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const next = await cursor.next();
      if (next) controller.enqueue(new Uint8Array(next.data.buffer));
      else {
        await cursor.close();
        controller.close();
      }
    },
    async cancel() {
      await cursor.close();
    },
  });

  const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
