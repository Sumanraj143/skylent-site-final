import Link from "next/link";
import { collections } from "@/lib/data";

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
          <p>Your library of student AI-agent projects. Aim for one per student in a workshop.</p>
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
            <thead><tr><th>Project</th><th>Category</th><th>Level</th><th>Files</th><th>Students</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id.toString()}>
                  <td>
                    <Link href={`/admin/projects/${p._id}`} className="p-link">{p.title}</Link>
                    {p.summary && <div className="p-sub">{p.summary}</div>}
                  </td>
                  <td>{p.category || "—"}</td>
                  <td>{p.difficulty}</td>
                  <td>{p.zipUrl ? "Zip ✓" : <span className="p-warn">No zip</span>}{p.interview?.length ? ` · ${p.interview.length} Q&A` : ""}</td>
                  <td>{countOf.get(p._id.toString()) || 0}</td>
                  <td><span className={`p-badge ${p.status === "published" ? "ok" : ""}`}>{p.status === "published" ? "Published" : "Draft"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
