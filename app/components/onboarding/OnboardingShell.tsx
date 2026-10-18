import { GridBackground, Logo } from "../layout";
import { Button } from "../ui";
import type { OnboardingFlow } from "@/lib/hooks/flags";
import { Stepper } from "./Stepper";

interface OnboardingShellProps {
  step: number;
  steps: OnboardingFlow["steps"];
  /** Omitted on the done screen, where there is nothing left to skip. */
  onSkipSetup?: () => void;
  /** The action strip: a `StepFooter`. Omitted while there is nothing to act on (the flags failed to load). */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The frame every setup screen shares, as one responsive tree. From `sm` up: header, then
 * an 880px offset card holding the stepper, the step and the action strip. Below it the
 * card falls away: the stepper sits on the grid, the step gets its own panel, and the
 * action strip sticks to the bottom of the screen.
 *
 * The header matches the dashboard Navbar's box (same padding, same `Logo`), and the card
 * hangs from a fixed offset under it rather than being centred, so the header and stepper
 * stay put while the step's content grows or shrinks.
 */
export function OnboardingShell({ step, steps, onSkipSetup, footer, children }: OnboardingShellProps) {
  return (
    <GridBackground>
      <div className="flex-1 flex flex-col font-mono text-fg">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
          <Logo />
          {onSkipSetup && (
            // the link's tall tap target overhangs the row instead of making the header taller
            <div className="-my-3">
              <Button variant="link" size="md" onClick={onSkipSetup}>
                Skip setup
              </Button>
            </div>
          )}
        </header>

        <main className="flex-1 flex flex-col sm:items-center sm:px-8 sm:pt-4 sm:pb-[72px]">
          <div className="relative w-full flex-1 flex flex-col sm:flex-none sm:max-w-[880px]">
            <span
              aria-hidden
              className="hidden sm:block absolute inset-0 border border-fg-placeholder translate-x-1.5 translate-y-1.5"
            />
            <div className="relative flex-1 flex flex-col sm:bg-surface/95 sm:border sm:border-border">
              <div className="px-4 sm:px-7 sm:pt-4 sm:pb-3.5 sm:border-b sm:border-border">
                <Stepper step={step} steps={steps} />
              </div>

              <div className="flex-1 px-4 py-5 sm:p-0">
                <section className="min-w-0 bg-surface/95 border border-border px-[18px] py-[22px] sm:bg-transparent sm:border-0 sm:px-10 sm:py-9">
                  {children}
                </section>
              </div>

              {footer && (
                <div
                  className="sticky bottom-0 z-10 border-t border-border bg-surface/95 px-4 pt-3.5
                             pb-[calc(0.75rem+env(safe-area-inset-bottom))]
                             sm:static sm:bg-transparent sm:px-10 sm:pt-4 sm:pb-5"
                >
                  {footer}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </GridBackground>
  );
}
