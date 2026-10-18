interface EmptyStateProps {
  message: string;
  /** Secondary line for a suggested next step. */
  hint?: string;
  /** A way forward under the text, e.g. a "Try again" button. */
  action?: React.ReactNode;
}

/** The centred "nothing here" block repeated across every panel. */
export function EmptyState({ message, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center gap-1">
      <span className="font-mono text-xs text-fg-body">{message}</span>
      {hint && <span className="font-mono text-xs text-fg-muted">{hint}</span>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
