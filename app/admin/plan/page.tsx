import SubmitButton from "@/components/SubmitButton";
import { savePlan } from "../actions";
import { getPlan } from "@/lib/data";

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const plan = await getPlan();
  return (
    <>
      <div className="p-head">
        <div>
          <h1>4-day plan</h1>
          <p>The same plan is used for every workshop. Students see each day only after you open it.</p>
        </div>
      </div>
      {saved && <div className="p-notice ok">Plan saved.</div>}
      <form action={savePlan} className="p-form">
        {plan.map((d) => (
          <section className="p-card" key={d.day}>
            <h2>Day {d.day}</h2>
            <div className="p-grid-2">
              <label className="p-field p-span-2"><span>Title</span><input name={`title-${d.day}`} defaultValue={d.title} /></label>
              <label className="p-field p-span-2"><span>Short description</span><input name={`summary-${d.day}`} defaultValue={d.summary} /></label>
              <label className="p-field p-span-2">
                <span>Sessions <em>one per line</em></span>
                <textarea name={`items-${d.day}`} rows={5} defaultValue={d.items.join("\n")} />
              </label>
            </div>
          </section>
        ))}
        <div className="p-form-foot"><SubmitButton>Save plan</SubmitButton></div>
      </form>
    </>
  );
}
