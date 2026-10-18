interface SectionLabelProps {
  children: React.ReactNode;
  /** For `aria-labelledby` on the section it names. */
  id?: string;
}

/** The small bold caption over a group inside a step ("Suggested for you", "Your invite link"). */
export function SectionLabel({ children, id }: SectionLabelProps) {
  return (
    <h2 id={id} className="text-xs font-semibold text-fg-body">
      {children}
    </h2>
  );
}
