import Link from "next/link";
import type { Filter } from "mongodb";
import AddStudentsForm from "../AddStudentsForm";
import { collections, toId } from "@/lib/data";
import type { UserDoc } from "@/lib/types";

const PAGE_SIZE = 50;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; batch?: string; paid?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const { users, batches, projects } = await collections();

  const filter: Filter<UserDoc> = { role: "student" };
  const batchId = toId(sp.batch);
  if (batchId) filter.batchId = batchId;
  if (sp.batch === "none") filter.batchId = null;
  if (sp.paid === "yes") filter.paid = true;
  if (sp.paid === "no") filter.paid = { $ne: true };
  if (q) {
    const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  const [list, total, batchList, projectList] = await Promise.all([
    users.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    users.countDocuments(filter),
    batches.find({}, { projection: { name: 1, college: 1 } }).sort({ startDate: -1 }).toArray(),
    projects.find({}, { projection: { title: 1 } }).toArray(),
  ]);
  const batchName = new Map(batchList.map((b) => [b._id.toString(), b.name]));
  const projectTitle = new Map(projectList.map((p) => [p._id.toString(), p.title]));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (n: number) => new URLSearchParams({ ...(q && { q }), ...(sp.batch && { batch: sp.batch }), ...(sp.paid && { paid: sp.paid }), page: String(n) }).toString();

  return (
    <>
      <div className="p-head">
        <div>
          <h1>Students</h1>
          <p>{total} {total === 1 ? "student" : "students"}{q || sp.batch || sp.paid ? " match your filters" : " in total"}.</p>
        </div>
      </div>

      <form className="p-filters">
        <input name="q" defaultValue={q} placeholder="Search name, email or phone" aria-label="Search students" />
        <select name="batch" defaultValue={sp.batch || ""} aria-label="Workshop">
          <option value="">All workshops</option>
          <option value="none">No workshop</option>
          {batchList.map((b) => (
            <option key={b._id.toString()} value={b._id.toString()}>{b.name}</option>
          ))}
        </select>
        <select name="paid" defaultValue={sp.paid || ""} aria-label="Payment">
          <option value="">Any payment</option>
          <option value="yes">Paid</option>
          <option value="no">Not paid</option>
        </select>
        <button className="p-btn p-btn-ghost">Filter</button>
      </form>

      <div className="p-card p-table-wrap">
        {list.length === 0 ? (
          <p className="p-help">No students found.</p>
        ) : (
          <table className="p-table">
            <thead><tr><th>Student</th><th>Workshop</th><th>AI project</th><th>Payment</th><th></th></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id.toString()}>
                  <td><strong>{s.name}</strong><div className="p-sub">{s.email}{s.phone ? ` · ${s.phone}` : ""}</div></td>
                  <td>{s.batchId ? batchName.get(s.batchId.toString()) || "—" : <span className="p-warn">None</span>}</td>
                  <td>{s.projectId ? projectTitle.get(s.projectId.toString()) || "—" : <span className="p-warn">None</span>}</td>
                  <td><span className={`p-badge ${s.paid ? "ok" : ""}`}>{s.paid ? "Paid" : "Pending"}</span></td>
                  <td><Link className="p-link" href={`/admin/students/${s._id}`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pages > 1 && (
          <div className="p-pager">
            {page > 1 && <Link className="p-link" href={`?${qs(page - 1)}`}>← Previous</Link>}
            <span>Page {page} of {pages}</span>
            {page < pages && <Link className="p-link" href={`?${qs(page + 1)}`}>Next →</Link>}
          </div>
        )}
      </div>

      <AddStudentsForm batches={batchList.map((b) => ({ id: b._id.toString(), label: `${b.name} — ${b.college}` }))} />
    </>
  );
}
