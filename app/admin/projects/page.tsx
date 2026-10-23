import Link from "next/link";
import { collections, formatBytes } from "@/lib/data";
import FileUpload from "@/components/FileUpload";
import SubmitButton from "@/components/SubmitButton";
import { deleteProject } from "../actions";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string; saved?: string; deleted?: string }> }) {
  const { q = "", saved, deleted } = await searchParams;
  const { projects, users } = await collections();
  const filter = q ? { title: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
  const [list, counts] = await Promise.all([
    projects.find(filter).sort({ createdAt: -1 }).toArray(),
    users.aggregate<{ _id: unknown; n: number }>([{ $match: { projectId: { $ne: null } } }, { $group: { _id: "$projectId", n: { $sum: 1 } } }]).toArray(),
  ]);
  const countOf = new Map(counts.map((c) => [String(c._id), c.n]));

  return (
    <>
      <div className="p-head">
        <div>
          <h1>AI projects</h1>
          <p>Your project library. Upload each project’s zip here, then pick the project for a student on the Students page.</p>
        </div>
        <Link href="/admin/projects/new" className="p-btn p-btn-primary">Add AI project</Link>
      </div>

      {saved && <div className="p-notice ok">Project saved.</div>}
      {deleted && <div className="p-notice">Project deleted.</div>}

      <form className="p-filters">
        <input name="q" defaultValue={q} placeholder="Search projects" aria-label="Search projects" />
        <button className="p-btn p-btn-ghost">Search</button>
      </form>

      {list.length === 0 ? (
        <div className="p-card p-empty">
          <p>{q ? "No projects match your search." : "No projects yet. Add your first AI-agent project."}</p>
          {!q && <Link href="/admin/projects/new" className="p-btn p-btn-primary">Add AI project</Link>}
        </div>
      ) : (
        <div className="p-table-wrap p-card">
          <table className="p-table">
            <thead><tr><th>#</th><th>Project</th><th>Project zip</th><th>Interview PDF</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((p, i) => (
                <tr key={p._id.toString()}>
                  <td className="p-num">{i + 1}</td>
                  <td>
                    <Link href={`/admin/projects/${p._id}`} className="p-link">{p.title}</Link>
                    {p.summary && <div className="p-sub">{p.summary}</div>}
                  </td>
                                    <td>
                    <FileUpload
                      compact
                      owner={{ kind: "project", id: p._id.toString(), name: p.title }}
                      file={p.fileId ? { id: p.fileId.toString(), name: p.fileName || "project.zip", size: formatBytes(p.fileSize) } : null}
                    />
                  </td>
                  <td>
                    <FileUpload
                      compact
                      slot="interview"
                      owner={{ kind: "project", id: p._id.toString(), name: p.title }}
                      file={p.interviewFileId ? { id: p.interviewFileId.toString(), name: p.interviewFileName || "interview.pdf", size: formatBytes(p.interviewFileSize) } : null}
                    />
                  </td>
                  <td>{countOf.get(p._id.toString()) || 0}</td>
                  <td><span className={`p-badge ${p.status === "published" ? "ok" : ""}`}>{p.status === "published" ? "Published" : "Draft"}</span></td>
                  <td>
                    <div className="p-row-actions">
                      <Link href={`/admin/projects/${p._id}`} className="p-btn p-btn-ghost p-btn-sm">Edit</Link>
                      <form action={deleteProject}>
                        <input type="hidden" name="id" value={p._id.toString()} />
                        <SubmitButton className="p-btn p-btn-danger p-btn-sm" pendingText="…" confirmText={`Delete “${p.title}”?`}>Delete</SubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
