"use client";

import { Button, IconButton, StepBar } from "../ui";
import { useOnboarding } from "@/lib/hooks/onboarding";
import {
  dismissReminderPatch,
  firstIncompleteStep,
  progressCount,
  showSetupReminder,
  STEP_KEYS,
} from "@/lib/utils/onboarding";

/**
 * The dashboard's compact "Finish setup" strip under the tiles, for a user who left setup
 * with tasks open. Resume goes to the first one not done; × hides it for good.
 */
export function SetupReminder() {
  const { flow, update } = useOnboarding();
  if (!flow || !showSetupReminder(flow)) return null;

  const done = progressCount(flow.steps);
  const resumeAt = firstIncompleteStep(flow.steps) ?? STEP_KEYS[0];

  return (
    <section
      aria-label="Setup reminder"
      className="mt-7 flex items-center gap-2.5 sm:gap-3.5 max-w-full border border-border bg-surface/90 py-1.5 pr-1.5 pl-3.5 font-mono"
    >
      <span className="text-xs text-fg-body whitespace-nowrap">Finish setup</span>
      <span aria-hidden className="flex gap-[3px]">
        {STEP_KEYS.map((key) => (
          <StepBar key={key} size="mini" filled={flow.steps[key] === "done"} />
        ))}
      </span>
      <span className="sr-only sm:not-sr-only text-[11px] text-fg-muted whitespace-nowrap">
        {`${done} of ${STEP_KEYS.length}`}
      </span>
      <Button variant="secondary" size="md" href={`/onboarding?step=${resumeAt}`}>
        Resume <span aria-hidden>→</span>
      </Button>
      <IconButton ariaLabel="Hide setup reminder" size="md" onClick={() => update(dismissReminderPatch)}>
        ×
      </IconButton>
    </section>
  );
}
