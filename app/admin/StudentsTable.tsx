import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import AutoSubmitSelect from "@/components/AutoSubmitSelect";
import StudentFileUpload from "@/components/StudentFileUpload";
import { deleteStudent, quickUpdateStudent, togglePaid } from "./actions";
import { formatBytes } from "@/lib/data";
import type { UserDoc } from "@/lib/types";

type Option = { value: string; label: string };

/** One row per student, with every action in the row. Used on Students and on each Workshop page. */
export default function StudentsTable({
  students,
  batches,
  projects,
  showBatch = true,
  back,
}: {
  students: UserDoc[];
  batches: Option[];
  projects: Option[];
  showBatch?: boolean;
  back: string;
}) {
  if (!students.length) return <p className="p-help">No students yet.</p>;

  return (
    <div className="p-table-wrap">
      <table className="p-table p-table-students">
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            {showBatch && <th>Workshop</th>}
            <th>AI project</th>
            <th>Payment</th>
            <th>Project files (zip)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const id = s._id.toString();
            return (
              <tr key={id}>
                <td className="p-num">{i + 1}</td>
                <td>
                  <strong>{s.name}</strong>
                  <div className="p-sub">{s.email}{s.phone ? ` · ${s.phone}` : ""}</div>
                </td>
                {showBatch && (
                  <td>
                    <form action={quickUpdateStudent}>
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="field" value="batchId" />
                      <AutoSubmitSelect name="value" label={`Workshop for ${s.name}`} defaultValue={s.batchId?.toString() || ""} options={batches} emptyLabel="No workshop" />
                    </form>
                  </td>
                )}
                <td>
                  <form action={quickUpdateStudent}>
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="field" value="projectId" />
                    <AutoSubmitSelect name="value" label={`Project for ${s.name}`} defaultValue={s.projectId?.toString() || ""} options={projects} emptyLabel="No project" />
                  </form>
                </td>
                <td>
                  <form action={togglePaid}>
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="paid" value={s.paid ? "false" : "true"} />
                    <SubmitButton className={`p-pill ${s.paid ? "ok" : ""}`} pendingText="…">{s.paid ? "Paid ✓" : "Mark paid"}</SubmitButton>
                  </form>
                </td>
                <td>
                  <StudentFileUpload
                    compact
                    studentId={id}
                    studentName={s.name}
                    file={s.fileId ? { id: s.fileId.toString(), name: s.fileName || "project.zip", size: formatBytes(s.fileSize) } : null}
                  />
                </td>
                <td>
                  <div className="p-row-actions">
                    <Link href={`/admin/students/${id}`} className="p-btn p-btn-ghost p-btn-sm">Edit</Link>
                    <form action={deleteStudent}>
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="back" value={back} />
                      <SubmitButton className="p-btn p-btn-danger p-btn-sm" pendingText="…" confirmText={`Delete ${s.name}? Their account and files are removed for good.`}>
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
