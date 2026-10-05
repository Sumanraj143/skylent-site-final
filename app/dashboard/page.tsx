import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileText, Lock, PlayCircle, Camera, CheckCircle2 } from "lucide-react";
import PanelShell from "@/components/PanelShell";
import SubmitButton from "@/components/SubmitButton";
import { setVideoConsent } from "../account/actions";
import { requireUser } from "@/lib/session";
import { collections, getPlan } from "@/lib/data";
import { studentAccess } from "@/lib/workshop";
import { SOCIAL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  if (user.mustChangePassword && user.password) redirect("/account/password");

  const shell = (children: React.ReactNode) => (
    <PanelShell
      userName={user.name}
      roleLabel={user.role === "student" ? "Student" : "Member"}
      links={[
        { href: "/dashboard", label: "My workshop" },
        { href: "/account/password", label: "Password" },
        { href: "/", label: "SKYLENT home" },
      ]}
    >
      {children}
    </PanelShell>
  );

  if (user.role !== "student") {
    return shell(
      <div className="p-card p-empty">
        <h1>Hi {user.name}</h1>
        <p>Your account isn’t part of a SKYLENT workshop yet. When your college joins a workshop, SKYLENT will add you and your project will appear here.</p>
        <Link href="/" className="p-btn p-btn-ghost">Explore SKYLENT</Link>
      </div>
    );
  }

  const { batches, projects } = await collections();
  const batch = user.batchId ? await batches.findOne({ _id: user.batchId }) : null;
  const access = studentAccess(user, batch);
  const [plan, project] = await Promise.all([
    getPlan(),
    access.canSeeProject && user.projectId ? projects.findOne({ _id: user.projectId }) : Promise.resolve(null),
  ]);

  return shell(
    <>
      <div className="p-head">
        <div>
          <h1>Hi {user.name.split(" ")[0]}</h1>
          <p>{batch ? `${batch.name} · ${batch.college}` : "You haven’t been added to a workshop yet."}</p>
        </div>
        {access.completed && <span className="p-badge big ok">Workshop complete</span>}
      </div>

      {!access.paid && (
        <div className="p-lock-card">
          <Lock size={20} />
          <div>
            <strong>Payment pending</strong>
            <p>Your workshop opens as soon as SKYLENT confirms your payment. Already paid? Tell your workshop coordinator.</p>
          </div>
        </div>
      )}
      {access.paid && !access.hasBatch && (
        <div className="p-lock-card">
          <Lock size={20} />
          <div><strong>Waiting for your workshop</strong><p>SKYLENT will add you to your college’s workshop soon.</p></div>
        </div>
      )}

      <section className="p-card">
        <h2>Your 4 days</h2>
        <ol className="s-days">
          {plan.map((d) => {
            const open = access.canSeeDay(d.day);
            return (
              <li key={d.day} className={open ? "open" : "locked"}>
                <div className="s-day-mark">{open ? <CheckCircle2 size={18} /> : <Lock size={16} />}</div>
                <div>
                  <span className="s-day-num">Day {d.day}</span>
                  <h3>{d.title}</h3>
                  {open ? (
                    <>
                      {d.summary && <p>{d.summary}</p>}
                      <ul>{d.items.map((item) => <li key={item}>{item}</li>)}</ul>
                    </>
                  ) : (
                    <p className="s-muted">Opens on Day {d.day} of your workshop.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="p-card s-project">
        <h2>Your AI agent project</h2>
        {!access.canSeeProject ? (
          <p className="s-muted"><Lock size={14} /> Your own project opens on Day 3.</p>
        ) : !project ? (
          <p className="s-muted">Your project is being assigned. Check back in a few minutes.</p>
        ) : (
          <>
            <div className="s-project-head">
              <div>
                <h3>{project.title}</h3>
                {project.summary && <p>{project.summary}</p>}
                <div className="s-tags">
                  <span>{project.difficulty}</span>
                  {project.category && <span>{project.category}</span>}
                  {project.techStack.map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>
              <div className="s-project-actions">
                {project.zipUrl && (
                  <a href={`/api/projects/${project._id}/download`} className="p-btn p-btn-primary"><Download size={16} /> Download project</a>
                )}
                {project.docsUrl && <a href={project.docsUrl} target="_blank" rel="noopener noreferrer" className="p-btn p-btn-ghost"><FileText size={16} /> Documentation</a>}
                {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="p-btn p-btn-ghost"><PlayCircle size={16} /> Demo video</a>}
              </div>
            </div>

            <div className="s-grid">
              {project.problem && <div><h4>The problem</h4><p className="s-pre">{project.problem}</p></div>}
              {project.howItWorks && <div><h4>How it works</h4><p className="s-pre">{project.howItWorks}</p></div>}
            </div>
            {project.setupSteps.length > 0 && (
              <div>
                <h4>Run it on your laptop</h4>
                <ol className="s-steps">{project.setupSteps.map((s, i) => <li key={i}><code>{s}</code></li>)}</ol>
              </div>
            )}
            {project.seminarTips && <div><h4>For your seminar</h4><p className="s-pre">{project.seminarTips}</p></div>}
          </>
        )}
      </section>

      <section className="p-card">
        <h2>Interview stack</h2>
        {!access.canSeeInterview ? (
          <p className="s-muted"><Lock size={14} /> Opens on Day 4, after your seminar.</p>
        ) : !project?.interview?.length ? (
          <p className="s-muted">Your interview questions will appear here soon.</p>
        ) : (
          <div className="s-qa">
            {project.interview.map((x, i) => (
              <details key={i}>
                <summary>{x.q}</summary>
                <p className="s-pre">{x.a}</p>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="p-card">
        <h2>Your seminar video</h2>
        {user.youtubeUrl || user.instagramUrl ? (
          <div className="p-actions">
            {user.youtubeUrl && <a className="p-btn p-btn-ghost" href={user.youtubeUrl} target="_blank" rel="noopener noreferrer"><PlayCircle size={16} /> Watch on YouTube</a>}
            {user.instagramUrl && <a className="p-btn p-btn-ghost" href={user.instagramUrl} target="_blank" rel="noopener noreferrer"><Camera size={16} /> Watch on Instagram</a>}
          </div>
        ) : (
          <p className="s-muted">After Day 4, your seminar Short will be linked here.</p>
        )}
        <form action={setVideoConsent} className="s-consent">
          <p>
            {user.videoConsent
              ? "You agreed that SKYLENT can post your seminar video on YouTube and Instagram."
              : "Can SKYLENT post your seminar video on YouTube and Instagram?"}
          </p>
          {user.videoConsent ? (
            <SubmitButton className="p-btn p-btn-text" name="agree" value="no" pendingText="Saving…">Withdraw permission</SubmitButton>
          ) : (
            <SubmitButton className="p-btn p-btn-ghost p-btn-sm" name="agree" value="yes" pendingText="Saving…">Yes, I agree</SubmitButton>
          )}
        </form>
      </section>

      <section className="p-card s-follow">
        <h2>Follow SKYLENT</h2>
        <p className="s-muted">Watch workshop highlights and seminar Shorts.</p>
        <div className="p-actions">
          <a className="p-btn p-btn-ghost" href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer"><PlayCircle size={16} /> YouTube</a>
          {SOCIAL.instagram && <a className="p-btn p-btn-ghost" href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"><Camera size={16} /> Instagram</a>}
        </div>
      </section>
    </>
  );
}
