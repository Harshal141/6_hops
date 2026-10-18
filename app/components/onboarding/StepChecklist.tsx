export interface ChecklistItem {
  key: string;
  done: boolean;
  label: string;
  /** Right-hand note: a count when done, where to find it when skipped. */
  note?: string;
}

/**
 * What setup achieved, one row per task, ticked or left open. From `sm` up the note sits in a
 * right-hand column. Below it there is no room for one: a skipped task's note (where to find
 * it) runs on inline after the label, and a done task's note (a count) is dropped.
 */
export function StepChecklist({ items }: { items: ChecklistItem[] }) {
  return (
    <ul className="flex flex-col border border-border bg-surface text-xs sm:text-[13px]">
      {items.map(({ key, done, label, note }) => (
        <li
          key={key}
          className={`flex items-center gap-2.5 sm:gap-3 px-3 py-[11px] sm:px-4 sm:py-3 border-b border-border/60 last:border-b-0
                      ${done ? "" : "text-fg-muted"}`}
        >
          {done ? (
            <span aria-hidden className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-fg text-surface text-[9px] sm:text-[10px] flex items-center justify-center">
              ✓
            </span>
          ) : (
            <span aria-hidden className="shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 border border-fg-subtle" />
          )}
          <span className="flex-1 min-w-0">
            <span className="sr-only">{done ? "Done: " : "Not done: "}</span>
            {label}
            {note && !done && <span className="sm:hidden">{`. ${note}`}</span>}
          </span>
          {note && <span className="hidden sm:inline shrink-0 text-[11px] text-fg-muted text-right">{note}</span>}
        </li>
      ))}
    </ul>
  );
}
