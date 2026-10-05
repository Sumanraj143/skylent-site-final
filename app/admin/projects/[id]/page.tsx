import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm from "../ProjectForm";
import { collections, toId } from "@/lib/data";

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
      <ProjectForm project={project} />
    </>
  );
}
