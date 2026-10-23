import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import BatchForm from "../BatchForm";
import AddStudentsForm from "../../AddStudentsForm";
import { autoAssignProjects, deleteBatch, setBatchDay } from "../../actions";
import StudentsTable from "../../StudentsTable";
import { collections, getPlan, toId } from "@/lib/data";
import { batchStatusLabel, COMPLETED } from "@/lib/workshop";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = toId((await params).id);
  if (!id) notFound();
  const { batches, users, projects } = await collections();
  const batch = await batches.findOne({ _id: id });
  if (!batch) notFound();

  const [students, projectList, plan] = await Promise.all([
    users.find({ batchId: id, role: "student" }).sort({ name: 1 }).toArray(),
    projects.find({}, { projection: { title: 1, status: 1, fileId: 1 } }).sort({ title: 1 }).toArray(),
    getPlan(),
  ]);
  const published = projectList.filter((p) => p.status === "published").length;
  const paid = students.filter((s) => s.paid).length;
  const withoutProject = students.filter((s) => !s.projectId).length;
  const day = batch.unlockedDay || 0;

  return (
    <>
      <div className="p-head">
        <div>
          <Link href="/admin/batches" className="p-back">← Workshops</Link>
          <h1>{batch.name}</h1>
          <p>{batch.college}{batch.startDate ? ` · Day 1 on ${batch.startDate}` : ""}</p>
        </div>
        <span className={`p-badge big ${day >= COMPLETED ? "ok" : day ? "live" : ""}`}>{batchStatusLabel(day)}</span>
      </div>

      <section className="p-stats">
        <div className="p-stat"><strong>{students.length}</strong><span>Students</span></div>
        <div className="p-stat"><strong>{paid}</strong><span>Paid</span></div>
        <div className="p-stat"><strong>{students.length - paid}</strong><span>Payment pending</span></div>
        <div className="p-stat"><strong>{withoutProject}</strong><span>Without a project</span></div>
      </section>

      <section className="p-card">
        <h2>Open workshop days</h2>
        <p className="p-help">
          Paid students in this workshop see each day once you open it. Day 3 opens their own AI project.
          Day 4 opens their interview stack. After “Complete”, everything stays open for them forever.
        </p>
        <div className="p-days">
          {plan.map((d) => (
            <form action={setBatchDay} key={d.day} className={`p-day ${day >= d.day ? "open" : ""} ${day === d.day ? "current" : ""}`}>
              <input type="hidden" name="id" value={batch._id.toString()} />
              <input type="hidden" name="day" value={d.day} />
              <span className="p-day-num">Day {d.day}</span>
              <strong>{d.title}</strong>
              {day >= d.day ? (
                <span className="p-day-state">Open</span>
              ) : (
                <SubmitButton className="p-btn p-btn-primary p-btn-sm" pendingText="Opening…">Open Day {d.day}</SubmitButton>
              )}
            </form>
          ))}
          <form action={setBatchDay} className={`p-day ${day >= COMPLETED ? "open current" : ""}`}>
            <input type="hidden" name="id" value={batch._id.toString()} />
            <input type="hidden" name="day" value={COMPLETED} />
            <span className="p-day-num">Finish</span>
            <strong>Workshop complete</strong>
            {day >= COMPLETED ? (
              <span className="p-day-state">Done</span>
            ) : (
              <SubmitButton className="p-btn p-btn-ghost p-btn-sm" pendingText="Saving…" confirmText="Mark this workshop as complete?">Complete</SubmitButton>
            )}
          </form>
        </div>
        {day > 0 && (
          <form action={setBatchDay} className="p-inline-form">
            <input type="hidden" name="id" value={batch._id.toString()} />
            <input type="hidden" name="day" value={Math.min(day, COMPLETED) - 1} />
            <SubmitButton className="p-btn p-btn-text" pendingText="Undoing…">Undo last step</SubmitButton>
          </form>
        )}
      </section>

      <section className="p-card">
        <div className="p-card-head">
          <h2>Students</h2>
          <form action={autoAssignProjects}>
            <input type="hidden" name="id" value={batch._id.toString()} />
            <SubmitButton className="p-btn p-btn-ghost p-btn-sm" pendingText="Assigning…">
              Auto-assign projects
            </SubmitButton>
          </form>
        </div>
        {withoutProject > 0 && published === 0 && (
          <div className="p-notice">Publish at least one AI project before assigning. <Link className="p-link" href="/admin/projects">Go to AI projects</Link></div>
        )}
        <StudentsTable
          students={students}
          batches={[]}
          projects={projectList.map((p) => ({ value: p._id.toString(), label: p.fileId ? p.title : `${p.title} (no zip yet)` }))}
          showBatch={false}
          back={`/admin/batches/${batch._id}`}
        />
      </section>

      <AddStudentsForm batches={[]} fixedBatchId={batch._id.toString()} />

      <BatchForm batch={batch} />

      <form action={deleteBatch} className="p-danger">
        <input type="hidden" name="id" value={batch._id.toString()} />
        <div>
          <strong>Delete this workshop</strong>
          <p>Students stay in the system but are removed from this workshop.</p>
        </div>
        <SubmitButton className="p-btn p-btn-danger" pendingText="Deleting…" confirmText={`Delete workshop “${batch.name}”?`}>
          Delete workshop
        </SubmitButton>
      </form>
    </>
  );
}
