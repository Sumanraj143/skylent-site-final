import Link from "next/link";
import PasswordForm from "./PasswordForm";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const user = await requireUser();
  const forced = Boolean(user.mustChangePassword);
  return (
    <main className="auth-page">
      <div className="auth-background-grid" />
      <nav className="auth-nav">
        <Link href="/" className="auth-brand"><img src="/branding/skylent-navbar.png" alt="SKYLENT" /></Link>
      </nav>
      <section className="auth-center">
        <div className="auth-card">
          <h1>{forced ? "Choose your password" : "Change password"}</h1>
          <p className="auth-description">
            {forced
              ? `Welcome, ${user.name}. Replace your temporary password with one only you know.`
              : "Pick a new password. You'll stay signed in on this device."}
          </p>
          <PasswordForm needsCurrent={Boolean(user.password)} forced={forced} />
        </div>
      </section>
    </main>
  );
}
