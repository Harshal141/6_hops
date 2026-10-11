interface SectionHeadingProps {
  label: string;
  title: string;
  align?: "left" | "center";
}

export function SectionHeading({ label, title, align = "left" }: SectionHeadingProps) {
  return (
    <div className={`mb-8 sm:mb-10 ${align === "center" ? "text-center" : ""}`}>
      <p className="font-mono text-xs text-fg-muted mb-2">{label}</p>
      <h2 className="font-mono text-2xl sm:text-3xl font-semibold text-fg tracking-tight">{title}</h2>
    </div>
  );
}
