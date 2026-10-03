interface FieldLabelProps {
  /** The small caption above the field. */
  label: string;
  children: React.ReactNode;
}

/** A compact caption stacked over a field, for inline groups (dates, years) where a full `Input` label is too loud. */
export function FieldLabel({ label, children }: FieldLabelProps) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="font-mono text-[11px] text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
