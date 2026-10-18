import { SocialLinks } from "../layout";
import { Button } from "../ui";
import { DONE_STEP, STEP_KEYS, WELCOME_STEP } from "@/lib/utils/onboarding";
import { StepFooter } from "./StepFooter";

interface StepActionsProps {
  step: number;
  /** The last move is still saving: every button is disabled until it lands. */
  busy?: boolean;
  /** Welcome's "Let's start". */
  onStart: () => void;
  onBack: () => void;
  /** "Continue", "Skip this step" and "Finish": leave the task and move on. */
  onNext: () => void;
  /** Welcome's "I'll explore on my own". */
  onSkipSetup: () => void;
  /** Done's "Go to dashboard". */
  onFinish: () => void;
}

/** The square-bracketed CTA label. The brackets are decoration, kept out of the accessible name. */
function Bracketed({ children }: { children: string }) {
  return (
    <>
      <span aria-hidden>[ </span>
      {children}
      <span aria-hidden> ]</span>
    </>
  );
}

/** The action strip's buttons for each screen. */
export function StepActions({ step, busy = false, onStart, onBack, onNext, onSkipSetup, onFinish }: StepActionsProps) {
  if (step === WELCOME_STEP) {
    return (
      <StepFooter
        primary={
          <Button variant="hero" fullWidth="mobile" disabled={busy} onClick={onStart}>
            <Bracketed>Let&apos;s start</Bracketed>
          </Button>
        }
        secondary={
          <Button variant="link" disabled={busy} onClick={onSkipSetup}>
            I&apos;ll explore on my own
          </Button>
        }
      />
    );
  }

  if (step === DONE_STEP) {
    return (
      <StepFooter
        primary={
          <Button variant="hero" fullWidth="mobile" disabled={busy} onClick={onFinish}>
            <Bracketed>Go to dashboard</Bracketed>
          </Button>
        }
        secondary={
          <span className="flex items-center gap-1">
            <span className="text-[11px] sm:text-xs text-fg-muted">Follow 6 hops</span>
            <SocialLinks iconSize={18} />
          </span>
        }
      />
    );
  }

  const isLast = step === STEP_KEYS.length;
  return (
    <StepFooter
      primary={
        <Button variant="hero" fullWidth="mobile" disabled={busy} onClick={onNext}>
          {isLast ? "Finish" : "Continue"}
        </Button>
      }
      secondary={
        <Button variant="link" disabled={busy} onClick={onBack}>
          <span aria-hidden>← </span>Back
        </Button>
      }
      skip={
        <Button variant="link" disabled={busy} onClick={onNext}>
          Skip this step
        </Button>
      }
    />
  );
}
