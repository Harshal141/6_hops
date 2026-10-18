"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, EmptyState, Spinner } from "../ui";
import { useOnboarding, type OnboardingUpdate } from "@/lib/hooks/onboarding";
import type { OnboardingStepKey } from "@/lib/hooks/flags";
import {
  completePatch, dashboardHref, DONE_STEP, goToStepPatch, leaveStepPatch, resumeStep,
  skipSetupPatch, startPatch, stepIndexOf, stepResultPatch,
} from "@/lib/utils/onboarding";
import { OnboardingShell } from "./OnboardingShell";
import { StepActions } from "./StepActions";
import { WelcomeStep } from "./WelcomeStep";
import { ProfileStep } from "./ProfileStep";
import { ConnectStep, type SentRequest } from "./ConnectStep";
import { InviteStep } from "./InviteStep";
import { DoneStep } from "./DoneStep";

interface OnboardingFlowProps {
  firstName: string;
  /** The signed-in user's full name, for the profile preview before the profile loads. */
  name: string;
  /** The signed-in email, shown read-only in the profile editor until the profile has one. */
  email: string;
  /** From `?step=`, already parsed; null to resume where the user left off. */
  requestedStep: number | null;
}

const nowIso = () => new Date().toISOString();

/** Owns the setup flow: which screen is up, and writing each move to the onboarding flag. */
export function OnboardingFlow({ firstName, name, email, requestedStep }: OnboardingFlowProps) {
  const router = useRouter();
  const { flow, isLoading, isError, retry, update } = useOnboarding();
  const [chosenStep, setChosenStep] = useState<number | null>(null);
  const [sent, setSent] = useState<SentRequest[]>([]);
  const started = useRef(false);
  // A screen change whose write is still in flight. The footer is disabled until it lands, so
  // a double click can't skip the next screen before it was ever seen. The ref closes the gap
  // before the disabled state renders; the state is what the user (and a test) can see.
  const moving = useRef(false);
  const [busy, setBusy] = useState(false);
  // Until the user moves, the screen follows the saved flow (it may still be loading).
  const step = chosenStep ?? resumeStep(flow, requestedStep);
  const steps = flow?.steps ?? {};

  // First open: mark the flow started (in_progress + started_at), and drop `?step=` so a
  // reload resumes from the saved step rather than the link's. Not when the flags failed
  // to load: the flow is unknown then, and a fresh one would overwrite real progress.
  useEffect(() => {
    if (isLoading || isError || started.current) return;
    started.current = true;
    update((current) => ({ ...startPatch(current, step, nowIso()), ...goToStepPatch(current, step) }));
    if (requestedStep !== null) window.history.replaceState(null, "", "/onboarding");
  }, [isLoading, isError, step, requestedStep, update]);

  /** Shows `target` now and saves the move; ignored while the previous move is still saving. */
  const move = (target: number, write: OnboardingUpdate) => {
    if (moving.current) return;
    moving.current = true;
    setBusy(true);
    setChosenStep(target);
    void update(write).finally(() => {
      moving.current = false;
      setBusy(false);
    });
  };
  const goTo = (target: number) => move(target, (current) => goToStepPatch(current, target));
  const leaveStep = () => move(Math.min(step + 1, DONE_STEP), (current) => leaveStepPatch(current, step));

  const markDone = useCallback(
    (key: OnboardingStepKey) => update((current) => stepResultPatch(current, key, "done")),
    [update],
  );
  const markProfileDone = useCallback(() => markDone("profile"), [markDone]);

  // Leaving setup waits for the write, so the dashboard's gate sees it; if it failed the
  // dashboard link carries the escape hatch instead of looping back here.
  // Leaving also counts as having opened the flow: "Skip setup" is clickable before the flags
  // load, and without this the first-open effect would then write a fresh in_progress flow
  // over the skip.
  // Always allowed, even mid-move: flag writes run in order, so the exit lands last.
  const exitTo = async (write: OnboardingUpdate) => {
    moving.current = true;
    setBusy(true);
    started.current = true;
    router.push(dashboardHref(await update(write)));
  };
  const skipSetup = () => exitTo((current) => skipSetupPatch(current, step, nowIso()));
  const finish = () => exitTo(() => completePatch(nowIso()));

  const importedProfile = () =>
    move(stepIndexOf("connect"), (current) => ({
      ...stepResultPatch(current, "profile", "done"),
      ...goToStepPatch(current, stepIndexOf("connect")),
    }));
  const requestSent = (request: SentRequest) => {
    setSent((prev) => (prev.some((item) => item.id === request.id) ? prev : [...prev, request]));
    markDone("connect");
  };

  const screens = [
    <WelcomeStep key="welcome" firstName={firstName} />,
    <ProfileStep
      key="profile"
      result={steps.profile}
      sessionName={name}
      sessionEmail={email}
      onDone={markProfileDone}
      onImported={importedProfile}
    />,
    <ConnectStep key="connect" sent={sent} onSent={requestSent} />,
    <InviteStep key="invite" onShared={() => markDone("invite")} />,
    <DoneStep key="done" steps={steps} sent={sent} />,
  ];

  return (
    <OnboardingShell
      step={step}
      steps={steps}
      onSkipSetup={step === DONE_STEP ? undefined : skipSetup}
      footer={
        isError ? undefined : (
          <StepActions
            step={step}
            busy={busy}
            onStart={() => goTo(1)}
            onBack={() => goTo(step - 1)}
            onNext={leaveStep}
            onSkipSetup={skipSetup}
            onFinish={finish}
          />
        )
      }
    >
      {isLoading ? (
        <div aria-busy className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        // Nothing is shown or saved from an unknown flow: a write built from it could
        // overwrite real progress. "Skip setup" in the header still leaves.
        <div role="alert">
          <EmptyState
            message="Couldn't load your setup."
            hint="Check your connection, then try again."
            action={
              <Button variant="secondary" size="md" onClick={() => void retry()}>
                Try again
              </Button>
            }
          />
        </div>
      ) : (
        screens[step]
      )}
    </OnboardingShell>
  );
}
