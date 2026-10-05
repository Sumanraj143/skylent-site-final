import Link from "next/link";
import { collections } from "@/lib/data";
import { batchStatusLabel } from "@/lib/workshop";

export default async function BatchesPage() {
  const { batches, users } = await collections();
  const [list, counts] = await Promise.all([
    batches.find().sort({ startDate: -1, createdAt: -1 }).toArray(),
    users
      .aggregate<{ _id: unknown; total: number; paid: number }>([
        { $match: { role: "student", batchId: { $ne: null } } },
        { $group: { _id: "$batchId", total: { $sum: 1 }, paid: { $sum: { $cond: ["$paid", 1, 0] } } } },
      ])
      .toArray(),
  ]);
  const countOf = new Map(counts.map((c) => [String(c._id), c]));

  return (
    <>
      <div className="p-head">
        <div>
          <h1>Workshops</h1>
          <p>Each workshop is one 4-day visit to a college. Open each day for students as you go.</p>
        </div>
        <Link href="/admin/batches/new" className="p-btn p-btn-primary">New workshop</Link>
      </div>

      {list.length === 0 ? (
        <div className="p-card p-empty">
          <p>No workshops yet.</p>
          <Link href="/admin/batches/new" className="p-btn p-btn-primary">Create first workshop</Link>
        </div>
      ) : (
        <div className="p-card p-table-wrap">
          <table className="p-table">
            <thead><tr><th>Workshop</th><th>College</th><th>Day 1</th><th>Students</th><th>Paid</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((b) => {
                const c = countOf.get(b._id.toString());
                return (
                  <tr key={b._id.toString()}>
                    <td><Link className="p-link" href={`/admin/batches/${b._id}`}>{b.name}</Link></td>
                    <td>{b.college}</td>
                    <td>{b.startDate || "—"}</td>
                    <td>{c?.total || 0}</td>
                    <td>{c?.paid || 0}</td>
                    <td><span className={`p-badge ${b.unlockedDay >= 5 ? "ok" : b.unlockedDay ? "live" : ""}`}>{batchStatusLabel(b.unlockedDay)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
