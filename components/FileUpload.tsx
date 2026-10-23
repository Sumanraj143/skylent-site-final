"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Download } from "lucide-react";

const MAX_BYTES = 50 * 1024 * 1024;

type Props = {
  /** Upload to a project (normal) or to one student. */
  owner: { kind: "project" | "student"; id: string; name: string };
  /** "zip" = project code (default), "interview" = interview questions PDF */
  slot?: "zip" | "interview";
  file?: { id: string; name: string; size: string } | null;
  compact?: boolean;
};

/** One "Upload" button: pick a .zip from your laptop. */
export default function FileUpload({ owner, slot = "zip", file, compact = false }: Props) {
  const ext = slot === "interview" ? ".pdf" : ".zip";
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(f: File) {
    if (!f.name.toLowerCase().endsWith(ext)) throw new Error(`Please choose a ${ext} file.`);
    if (f.size > MAX_BYTES) throw new Error("File is larger than 50 MB.");

    setStatus("Starting…");
    const start = await fetch("/api/admin/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [owner.kind === "project" ? "projectId" : "studentId"]: owner.id, slot, name: f.name, size: f.size }),
    }).then((r) => r.json());
    if (!start.success) throw new Error(start.message);

    const total = Math.ceil(f.size / start.chunkSize);
    for (let n = 0; n < total; n++) {
      const piece = f.slice(n * start.chunkSize, (n + 1) * start.chunkSize);
      const res = await fetch(`/api/admin/files/${start.fileId}?n=${n}`, { method: "PUT", body: piece });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Upload failed.");
      setStatus(`Uploading… ${Math.round(((n + 1) / total) * 100)}%`);
    }

    const done = await fetch(`/api/admin/files/${start.fileId}`, { method: "POST" }).then((r) => r.json());
    if (!done.success) throw new Error(done.message);
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      await upload(f);
      setStatus("Uploaded ✓");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    if (!file || !window.confirm(`Remove “${file.name}” from ${owner.name}?`)) return;
    setBusy(true);
    await fetch(`/api/admin/files/${file.id}`, { method: "DELETE" });
    setBusy(false);
    setStatus("");
    router.refresh();
  }

  return (
    <div className={`p-upload ${compact ? "compact" : ""}`}>
      {file && (
        <div className="p-file">
          <a href={`/api/files/${file.id}`} className="p-link" title="Download">
            <Download size={14} /> {file.name}
          </a>
          <span className="p-sub">{file.size}</span>
          <button type="button" className="p-icon-btn" onClick={remove} disabled={busy} aria-label={`Remove file from ${owner.name}`}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
      <div className="p-upload-btns">
        <button type="button" className="p-btn p-btn-ghost p-btn-sm" disabled={busy} onClick={() => input.current?.click()}>
          <Upload size={14} /> {file ? "Replace" : "Upload"}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept={slot === "interview" ? ".pdf,application/pdf" : ".zip,application/zip,application/x-zip-compressed"}
        hidden
        onChange={onPick}
      />
      {status && <div className="p-upload-status" role="status">{status}</div>}
    </div>
  );
}
