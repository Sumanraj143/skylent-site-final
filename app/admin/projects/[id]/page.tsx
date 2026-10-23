import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm from "../ProjectForm";
import { collections, formatBytes, toId } from "@/lib/data";
import FileUpload from "@/components/FileUpload";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = toId((await params).id);
  if (!id) notFound();
  const { projects, users } = await collections();
  const [project, assigned] = await Promise.all([projects.findOne({ _id: id }), users.countDocuments({ projectId: id })]);
  if (!project) notFound();

  return (
    <>
      <div className="p-head">
        <div>
          <Link href="/admin/projects" className="p-back">← AI projects</Link>
          <h1>{project.title}</h1>
          <p>{assigned} {assigned === 1 ? "student has" : "students have"} this project.</p>
        </div>
      </div>
      <section className="p-card">
        <h2>Project zip</h2>
        <p className="p-help">Every student you give this project to can download this zip from Day 3. Remove node_modules / venv before zipping.</p>
        <FileUpload
          owner={{ kind: "project", id: project._id.toString(), name: project.title }}
          file={project.fileId ? { id: project.fileId.toString(), name: project.fileName || "project.zip", size: formatBytes(project.fileSize) } : null}
        />
      </section>
      <section className="p-card">
        <h2>Interview questions (PDF)</h2>
        <p className="p-help">Students with this project can download this PDF from Day 4 to prepare for interviews.</p>
        <FileUpload
          slot="interview"
          owner={{ kind: "project", id: project._id.toString(), name: project.title }}
          file={project.interviewFileId ? { id: project.interviewFileId.toString(), name: project.interviewFileName || "interview.pdf", size: formatBytes(project.interviewFileSize) } : null}
        />
      </section>
      <ProjectForm project={project} />
    </>
  );
}
