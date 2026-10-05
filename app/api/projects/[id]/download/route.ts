import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { collections, toId } from "@/lib/data";
import { studentAccess } from "@/lib/workshop";

/**
 * Students never see the raw zip link in the page. They click this route,
 * we check they are allowed, then send them to the file.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = toId(id);
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!projectId) return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });

  const { projects, batches } = await collections();
  const project = await projects.findOne({ _id: projectId });
  if (!project?.zipUrl) return NextResponse.json({ success: false, message: "No download is available yet." }, { status: 404 });

  if (user.role !== "admin") {
    const batch = user.batchId ? await batches.findOne({ _id: user.batchId }) : null;
    const access = studentAccess(user, batch);
    const owns = user.projectId?.toString() === project._id.toString();
    if (user.role !== "student" || !owns || !access.canSeeProject) {
      return NextResponse.json({ success: false, message: "This project is not unlocked for your account." }, { status: 403 });
    }
  }
  return NextResponse.redirect(project.zipUrl);
}
