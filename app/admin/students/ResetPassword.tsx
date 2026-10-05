"use client";

import { useActionState } from "react";
import { resetStudentPassword } from "../actions";

export default function ResetPassword({ id }: { id: string }) {
  const [state, action, pending] = useActionState(resetStudentPassword, null);
  return (
    <form
      action={action}
      className="p-card"
      onSubmit={(e) => {
        if (!window.confirm("Create a new temporary password? The old password stops working.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <h2>Password</h2>
      <p className="p-help">Forgot their password? Create a temporary one and share it with the student.</p>
      {state?.password ? (
        <p className="p-help">
          New temporary password: <code className="p-code">{state.password}</code> — shown only once.
        </p>
      ) : null}
      <button className="p-btn p-btn-ghost" disabled={pending}>{pending ? "Creating…" : "Create temporary password"}</button>
    </form>
  );
}
