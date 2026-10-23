"use client";

/** A <select> that saves as soon as you pick a value (no extra Save button). */
export default function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  emptyLabel,
  label,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  emptyLabel: string;
  label: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={label}
      className="p-cell-select"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      <option value="">{emptyLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
