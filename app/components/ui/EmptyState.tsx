interface EmptyStateProps {
  message: string;
  /** Secondary line for a suggested next step. */
  hint?: string;
}

/** The centred "nothing here" block repeated across every panel. */
export function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center gap-1">
      <span className="font-mono text-xs text-neutral-400">{message}</span>
      {hint && <span className="font-mono text-xs text-neutral-300">{hint}</span>}
    </div>
  );
}
