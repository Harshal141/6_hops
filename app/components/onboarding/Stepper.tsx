import { StepBar } from "../ui";
import type { OnboardingFlow } from "@/lib/hooks/flags";
import { DONE_STEP, STEP_KEYS, WELCOME_STEP } from "@/lib/utils/onboarding";
import { STEP_LABELS } from "./stepCopy";

interface StepperProps {
  /** The screen shown: 0 welcome, 1 to 3 a task, 4 done. */
  step: number;
  steps: OnboardingFlow["steps"];
}

/**
 * The three-task progress strip. A bar fills once its task is reached; a task that was
 * actually done also gets a ✓. Labels sit under the bars from `sm` up; below it a single
 * "Step N of 3" caption replaces them visually, while screen readers keep the list.
 */
export function Stepper({ step, steps }: StepperProps) {
  const current = STEP_KEYS[step - 1];
  const caption =
    step === WELCOME_STEP
      ? "Getting started · 3 steps"
      : step === DONE_STEP
        ? "All set"
        : `Step ${step} of ${STEP_KEYS.length} · ${STEP_LABELS[current]}`;

  return (
    <div className="flex flex-col gap-2">
      <ol aria-label="Setup progress" className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {STEP_KEYS.map((key, index) => {
          const position = index + 1;
          const isCurrent = position === step;
          const reached = position <= step;
          const done = steps[key] === "done";
          const state = done ? "done" : steps[key] === "skipped" ? "skipped" : isCurrent ? "current" : "to do";

          return (
            <li key={key} aria-current={isCurrent ? "step" : undefined} className="flex flex-col gap-2">
              <StepBar filled={reached || done} />
              <span
                className={`sr-only sm:not-sr-only text-[11px] ${
                  isCurrent ? "font-semibold text-fg" : done ? "text-fg-body" : "text-fg-muted"
                }`}
              >
                {done && <span aria-hidden>✓ </span>}
                {`0${position} · ${STEP_LABELS[key]}`}
                <span className="sr-only">{`, ${state}`}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p aria-hidden className="sm:hidden text-[11px] text-fg-body">
        {caption}
      </p>
    </div>
  );
}
