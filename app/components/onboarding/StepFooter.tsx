interface StepFooterProps {
  /** The main action, full width below `sm`. */
  primary: React.ReactNode;
  /** Left on desktop ("Back", "I'll explore on my own", the social links); under the primary on mobile. */
  secondary?: React.ReactNode;
  /** "Skip this step": beside the primary on desktop, opposite `secondary` on mobile. */
  skip?: React.ReactNode;
}

/**
 * The action strip, laid out by grid so one tree serves both shapes:
 *
 *   desktop  [secondary ............ skip  primary]
 *   mobile   [primary.......................primary]
 *            [secondary ...................... skip]   (secondary centred when no skip)
 */
export function StepFooter({ primary, secondary, skip }: StepFooterProps) {
  return (
    <div className="grid grid-cols-2 items-center gap-x-6 gap-y-1.5 sm:grid-cols-[1fr_auto_auto]">
      <div className="col-span-2 row-start-1 sm:col-span-1 sm:col-start-3">{primary}</div>
      {secondary && (
        <div
          className={
            skip
              ? "row-start-2 col-start-1 justify-self-start sm:row-start-1"
              : "row-start-2 col-span-2 justify-self-center sm:col-span-1 sm:row-start-1 sm:col-start-1 sm:justify-self-start"
          }
        >
          {secondary}
        </div>
      )}
      {skip && <div className="row-start-2 col-start-2 justify-self-end sm:row-start-1 sm:col-start-2">{skip}</div>}
    </div>
  );
}
