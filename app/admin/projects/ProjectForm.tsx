import SubmitButton from "@/components/SubmitButton";
import { deleteProject, saveProject } from "../actions";
import { interviewToText } from "@/lib/workshop";
import type { ProjectDoc } from "@/lib/types";

export default function ProjectForm({ project }: { project?: ProjectDoc }) {
  const p = project;
  return (
    <>
      <form action={saveProject} className="p-form">
        {p && <input type="hidden" name="id" value={p._id.toString()} />}

        <section className="p-card">
          <h2>Basics</h2>
          <div className="p-grid-2">
            <label className="p-field p-span-2">
              <span>Project title</span>
              <input name="title" required defaultValue={p?.title} placeholder="Resume Screening Agent" />
            </label>
            <label className="p-field">
              <span>Category</span>
              <input name="category" defaultValue={p?.category} placeholder="Careers, Education, Health…" />
            </label>
            <label className="p-field">
              <span>Level</span>
              <select name="difficulty" defaultValue={p?.difficulty || "Beginner"}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
            <label className="p-field p-span-2">
              <span>One-line summary</span>
              <input name="summary" defaultValue={p?.summary} placeholder="Reads a resume and gives a score with clear feedback." />
            </label>
            <label className="p-field p-span-2">
              <span>Tech stack <em>comma separated</em></span>
              <input name="techStack" defaultValue={p?.techStack?.join(", ")} placeholder="Python, Streamlit, Gemini API" />
            </label>
          </div>
        </section>

        <section className="p-card">
          <h2>What students learn</h2>
          <label className="p-field">
            <span>The real problem it solves</span>
            <textarea name="problem" rows={3} defaultValue={p?.problem} />
          </label>
          <label className="p-field">
            <span>How it works <em>architecture in simple words</em></span>
            <textarea name="howItWorks" rows={5} defaultValue={p?.howItWorks} placeholder="1. User uploads a resume&#10;2. The agent extracts skills&#10;3. …" />
          </label>
          <label className="p-field">
            <span>Setup steps <em>one per line</em></span>
            <textarea name="setupSteps" rows={5} defaultValue={p?.setupSteps?.join("\n")} placeholder="Unzip the project&#10;pip install -r requirements.txt&#10;Add your API key to .env&#10;streamlit run app.py" />
          </label>
          <label className="p-field">
            <span>Seminar tips <em>what to show on Day 4</em></span>
            <textarea name="seminarTips" rows={4} defaultValue={p?.seminarTips} />
          </label>
        </section>

        <section className="p-card">
          <h2>Files and links</h2>
          <p className="p-help">
            Upload the zip to Google Drive (Anyone with the link → Viewer) or a GitHub release, and paste the link here.
            Students never see this link directly — they download through their own login.
          </p>
          <div className="p-grid-2">
            <label className="p-field p-span-2">
              <span>Project zip link</span>
              <input name="zipUrl" type="url" defaultValue={p?.zipUrl} placeholder="https://drive.google.com/…" />
            </label>
            <label className="p-field">
              <span>Documentation link <em>optional</em></span>
              <input name="docsUrl" type="url" defaultValue={p?.docsUrl} />
            </label>
            <label className="p-field">
              <span>Demo video link <em>optional</em></span>
              <input name="demoUrl" type="url" defaultValue={p?.demoUrl} />
            </label>
          </div>
        </section>

        <section className="p-card">
          <h2>Interview stack</h2>
          <p className="p-help">Write each question as “Q:” and its answer as “A:”. Leave a blank line between questions.</p>
          <label className="p-field">
            <span>Questions and answers</span>
            <textarea
              name="interview"
              rows={12}
              defaultValue={interviewToText(p?.interview)}
              placeholder={"Q: What problem does your agent solve?\nA: Recruiters spend hours reading resumes…\n\nQ: Why did you choose this model?\nA: …"}
            />
          </label>
        </section>

        <div className="p-form-foot">
          <label className="p-field p-inline">
            <span>Status</span>
            <select name="status" defaultValue={p?.status || "draft"}>
              <option value="draft">Draft — only admins see it</option>
              <option value="published">Published — can be assigned to students</option>
            </select>
          </label>
          <SubmitButton>{p ? "Save changes" : "Create project"}</SubmitButton>
        </div>
      </form>

      {p && (
        <form action={deleteProject} className="p-danger">
          <input type="hidden" name="id" value={p._id.toString()} />
          <div>
            <strong>Delete this project</strong>
            <p>Students who have it will be left without a project.</p>
          </div>
          <SubmitButton className="p-btn p-btn-danger" pendingText="Deleting…" confirmText={`Delete “${p.title}”? This can't be undone.`}>
            Delete project
          </SubmitButton>
        </form>
      )}
    </>
  );
}
