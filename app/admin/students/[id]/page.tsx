import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import ResetPassword from "../ResetPassword";
import { updateStudent } from "../../actions";
import { collections, toId } from "@/lib/data";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const id = toId((await params).id);
  if (!id) notFound();
  const { saved } = await searchParams;
  const { users, batches, projects } = await collections();
  const student = await users.findOne({ _id: id });
  if (!student) notFound();
  const [batchList, projectList] = await Promise.all([
    batches.find({}, { projection: { name: 1, college: 1 } }).sort({ startDate: -1 }).toArray(),
    projects.find({}, { projection: { title: 1, status: 1 } }).sort({ title: 1 }).toArray(),
  ]);

  return (
    <>
      <div className="p-head">
        <div>
          <Link href="/admin/students" className="p-back">← Students</Link>
          <h1>{student.name}</h1>
          <p>{student.email}{student.googleId ? " · uses Google sign-in" : ""}</p>
        </div>
      </div>
      {saved && <div className="p-notice ok">Student saved.</div>}

      <form action={updateStudent} className="p-form">
        <input type="hidden" name="id" value={student._id.toString()} />
        <section className="p-card">
          <h2>Details</h2>
          <div className="p-grid-2">
            <label className="p-field"><span>Full name</span><input name="name" defaultValue={student.name} /></label>
            <label className="p-field"><span>Phone</span><input name="phone" defaultValue={student.phone} /></label>
            <label className="p-field">
              <span>Workshop</span>
              <select name="batchId" defaultValue={student.batchId?.toString() || ""}>
                <option value="">No workshop</option>
                {batchList.map((b) => (
                  <option key={b._id.toString()} value={b._id.toString()}>{b.name} — {b.college}</option>
                ))}
              </select>
            </label>
            <label className="p-field">
              <span>AI project</span>
              <select name="projectId" defaultValue={student.projectId?.toString() || ""}>
                <option value="">No project</option>
                {projectList.map((p) => (
                  <option key={p._id.toString()} value={p._id.toString()}>{p.title}{p.status === "draft" ? " (draft)" : ""}</option>
                ))}
              </select>
            </label>
            <label className="p-check"><input type="checkbox" name="paid" defaultChecked={student.paid} /> Paid for the workshop</label>
            <label className="p-field">
              <span>Account type</span>
              <select name="role" defaultValue={student.role === "student" ? "student" : "member"}>
                <option value="student">Student — sees their workshop</option>
                <option value="member">Member — no workshop access</option>
              </select>
            </label>
          </div>
        </section>

        <section className="p-card">
          <h2>Seminar videos</h2>
          <p className="p-help">
            Paste the links to this student’s seminar Short. They appear on the student’s dashboard.
            Video consent: <strong>{student.videoConsent ? "given" : "not given yet"}</strong> — only post videos of students who agreed.
          </p>
          <div className="p-grid-2">
            <label className="p-field"><span>YouTube link</span><input name="youtubeUrl" type="url" defaultValue={student.youtubeUrl} /></label>
            <label className="p-field"><span>Instagram link</span><input name="instagramUrl" type="url" defaultValue={student.instagramUrl} /></label>
          </div>
        </section>

        <div className="p-form-foot">
          <SubmitButton>Save student</SubmitButton>
        </div>
      </form>

      <ResetPassword id={student._id.toString()} />
    </>
  );
}
