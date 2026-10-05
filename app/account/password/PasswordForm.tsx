"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { changePassword } from "../actions";

export default function PasswordForm({ needsCurrent, forced }: { needsCurrent: boolean; forced: boolean }) {
  const [state, action, pending] = useActionState(changePassword, null);

  useEffect(() => {
    if (state?.done) {
      const t = setTimeout(() => (window.location.href = state.done!), 1200);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <form action={action} className="auth-form">
      <label>
        <span>{forced ? "Temporary password" : "Current password"}</span>
        <div className="auth-input">
          <input name="current" type="password" required={needsCurrent} autoComplete="current-password" />
        </div>
      </label>
      <label>
        <span>New password</span>
        <div className="auth-input">
          <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
        </div>
      </label>
      <label>
        <span>Confirm new password</span>
        <div className="auth-input">
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </div>
      </label>
      <button className="auth-submit" disabled={pending || Boolean(state?.done)}>
        {pending ? "Saving…" : state?.done ? "Saved" : "Save new password"}
      </button>
      {state?.error && <div className="auth-message" role="alert"><span>{state.error}</span></div>}
      {state?.done && <div className="auth-message" role="status"><span>Password changed. Taking you to your dashboard…</span></div>}
      {!forced && <Link href="/dashboard" className="auth-login-link">Back to dashboard</Link>}
    </form>
  );
}
