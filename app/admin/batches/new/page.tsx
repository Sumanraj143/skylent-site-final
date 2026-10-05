import Link from "next/link";
import BatchForm from "../BatchForm";

export default function NewBatchPage() {
  return (
    <>
      <div className="p-head">
        <div>
          <Link href="/admin/batches" className="p-back">← Workshops</Link>
          <h1>New workshop</h1>
          <p>Create one workshop for each college visit. Next, you’ll add its students.</p>
        </div>
      </div>
      <BatchForm />
    </>
  );
}
