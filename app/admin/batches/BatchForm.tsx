import SubmitButton from "@/components/SubmitButton";
import { saveBatch } from "../actions";
import type { BatchDoc } from "@/lib/types";

export default function BatchForm({ batch }: { batch?: BatchDoc }) {
  return (
    <form action={saveBatch} className="p-form p-card">
      {batch && <input type="hidden" name="id" value={batch._id.toString()} />}
      <h2>{batch ? "Workshop details" : "Workshop details"}</h2>
      <div className="p-grid-2">
        <label className="p-field">
          <span>Workshop name</span>
          <input name="name" required defaultValue={batch?.name} placeholder="AI Agents Workshop — Nov 2026" />
        </label>
        <label className="p-field">
          <span>College</span>
          <input name="college" required defaultValue={batch?.college} placeholder="ABC Engineering College, Vijayawada" />
        </label>
        <label className="p-field">
          <span>Day 1 date</span>
          <input name="startDate" type="date" defaultValue={batch?.startDate} />
        </label>
        <label className="p-field">
          <span>Notes <em>only admins see this</em></span>
          <input name="notes" defaultValue={batch?.notes} placeholder="Contact: HOD CSE, 9xxxxxxxxx" />
        </label>
      </div>
      <div className="p-form-foot">
        <SubmitButton>{batch ? "Save details" : "Create workshop"}</SubmitButton>
      </div>
    </form>
  );
}
