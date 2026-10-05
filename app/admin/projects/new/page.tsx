import Link from "next/link";
import ProjectForm from "../ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <div className="p-head">
        <div>
          <Link href="/admin/projects" className="p-back">← AI projects</Link>
          <h1>New AI project</h1>
          <p>Students only see a project after it is published and assigned to them.</p>
        </div>
      </div>
      <ProjectForm />
    </>
  );
}
