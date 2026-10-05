import Link from "next/link";
import { collections } from "@/lib/data";
import { batchStatusLabel } from "@/lib/workshop";

export default async function AdminOverview() {
  const { users, projects, batches } = await collections();
  const [students, paid, published, drafts, batchList, unassigned] = await Promise.all([
    users.countDocuments({ role: "student" }),
    users.countDocuments({ role: "student", paid: true }),
    projects.countDocuments({ status: "published" }),
    projects.countDocuments({ status: "draft" }),
    batches.find().sort({ startDate: -1 }).limit(6).toArray(),
    users.countDocuments({ role: "student", paid: true, $or: [{ projectId: null }, { projectId: { $exists: false } }] }),
  ]);

  return (
    <>
      <div className="p-head">
        <div>
          <h1>Overview</h1>
          <p>Everything for your workshops in one place.</p>
        </div>
        <div className="p-actions">
          <Link href="/admin/batches/new" className="p-btn p-btn-primary">New workshop</Link>
          <Link href="/admin/projects/new" className="p-btn p-btn-ghost">Add AI project</Link>
        </div>
      </div>

      <section className="p-stats">
        <div className="p-stat"><strong>{students}</strong><span>Students</span></div>
        <div className="p-stat"><strong>{paid}</strong><span>Paid</span></div>
        <div className="p-stat"><strong>{students - paid}</strong><span>Payment pending</span></div>
        <div className="p-stat"><strong>{published}</strong><span>Published projects{drafts ? ` · ${drafts} drafts` : ""}</span></div>
      </section>

      {unassigned > 0 && (
        <div className="p-notice">
          {unassigned} paid {unassigned === 1 ? "student has" : "students have"} no AI project yet. Open a workshop and use “Auto-assign projects”.
        </div>
      )}

      <section className="p-card">
        <div className="p-card-head">
          <h2>Workshops</h2>
          <Link href="/admin/batches" className="p-link">See all</Link>
        </div>
        {batchList.length === 0 ? (
          <div className="p-empty">
            <p>No workshops yet. Create one for each college visit, then add students to it.</p>
            <Link href="/admin/batches/new" className="p-btn p-btn-primary">Create first workshop</Link>
          </div>
        ) : (
          <div className="p-table-wrap">
            <table className="p-table">
              <thead><tr><th>Workshop</th><th>College</th><th>Start</th><th>Status</th></tr></thead>
              <tbody>
                {batchList.map((b) => (
                  <tr key={b._id.toString()}>
                    <td><Link href={`/admin/batches/${b._id}`} className="p-link">{b.name}</Link></td>
                    <td>{b.college}</td>
                    <td>{b.startDate || "—"}</td>
                    <td><span className={`p-badge ${b.unlockedDay >= 5 ? "ok" : b.unlockedDay ? "live" : ""}`}>{batchStatusLabel(b.unlockedDay)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
