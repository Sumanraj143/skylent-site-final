"use client";

import { useActionState, useState } from "react";
import { addStudents, type AddStudentsResult } from "./actions";

type Option = { id: string; label: string };

export default function AddStudentsForm({ batches, fixedBatchId }: { batches: Option[]; fixedBatchId?: string }) {
  const [state, action, pending] = useActionState<AddStudentsResult, FormData>(addStudents, null);
  const [copied, setCopied] = useState(false);
  const created = state?.rows.filter((r) => r.password) ?? [];

  async function copyAll() {
    const text = created.map((r) => `${r.name}\t${r.email}\t${r.password}`).join("\n");
    await navigator.clipboard.writeText(`Name\tEmail\tTemporary password\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-card">
      <h2>Add students</h2>
      <p className="p-help">
        One student per line: <code>Full name, email</code> — you can add a phone number as a third value.
        You can paste straight from Excel or Google Sheets.
      </p>
      <form action={action} className="p-form">
        <label className="p-field">
          <span>Students</span>
          <textarea name="students" rows={6} required placeholder={"Ravi Kumar, ravi@gmail.com\nAnjali Rao, anjali@gmail.com, 9876543210"} />
        </label>
        <div className="p-grid-2">
          {fixedBatchId ? (
            <input type="hidden" name="batchId" value={fixedBatchId} />
          ) : (
            <label className="p-field">
              <span>Workshop</span>
              <select name="batchId" defaultValue="">
                <option value="">No workshop yet</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </label>
          )}
          <div className="p-checks">
            <label className="p-check"><input type="checkbox" name="paid" /> Already paid</label>
            <label className="p-check"><input type="checkbox" name="sendEmail" /> Email login details <em>(needs a verified Resend domain)</em></label>
          </div>
        </div>
        <div className="p-form-foot">
          <button className="p-btn p-btn-primary" disabled={pending}>{pending ? "Adding…" : "Add students"}</button>
        </div>
      </form>

      {state?.error && <div className="p-notice">{state.error}</div>}

      {state && state.rows.length > 0 && (
        <div className="p-result">
          <div className="p-card-head">
            <h3>Results</h3>
            {created.length > 0 && (
              <button type="button" className="p-btn p-btn-ghost p-btn-sm" onClick={copyAll}>
                {copied ? "Copied" : "Copy logins"}
              </button>
            )}
          </div>
          {created.length > 0 && (
            <p className="p-help p-warn">
              Save these passwords now — they are shown only once. Share them with students (WhatsApp, printout).
              Each student picks a new password on first sign-in.
            </p>
          )}
          <div className="p-table-wrap">
            <table className="p-table">
              <thead><tr><th>Name</th><th>Email</th><th>Temporary password</th><th>Result</th></tr></thead>
              <tbody>
                {state.rows.map((r, i) => (
                  <tr key={`${r.email}-${i}`}>
                    <td>{r.name}</td>
                    <td>{r.email || "—"}</td>
                    <td>{r.password ? <code className="p-code">{r.password}</code> : "—"}</td>
                    <td>{r.status}{r.emailed ? " · emailed" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
