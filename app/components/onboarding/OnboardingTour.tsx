"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Coachmark } from "../ui";
import { useFlags, usePatchFlag } from "@/lib/hooks/flags";

const STEPS = [
  {
    target: "connections",
    title: "Connections",
    description: "See who you're linked to and respond to incoming requests here.",
  },
  {
    target: "discover",
    title: "Discover",
    description: "Search for people already on the platform and send them a connection request.",
  },
  {
    target: "graph",
    title: "Graph",
    description: "Visualize your network and see how you're connected to everyone else.",
  },
] as const;

const nowIso = () => new Date().toISOString();

/**
 * First-login tour over the dashboard's three tiles. Reads/writes the
 * `onboarding` flag flow so a user who leaves mid-tour and comes back resumes
 * at the same step instead of seeing it from scratch — and the flow records
 * the highest step reached even on skip, so drop-off is measurable later.
 */
export function OnboardingTour() {
  const { data: flags, isLoading } = useFlags();
  const patchFlag = usePatchFlag();
  const [rect, setRect] = useState<DOMRect | null>(null);

  const onboarding = flags?.onboarding;
  const active =
    !isLoading && (!onboarding || onboarding.status === "not_started" || onboarding.status === "in_progress");
  const step = Math.min(onboarding?.current_step ?? 0, STEPS.length - 1);

  // First time this user has ever been seen by this flow — open it.
  useEffect(() => {
    if (isLoading || onboarding) return;
    patchFlag.mutate({
      flow: "onboarding",
      patch: {
        status: "in_progress",
        current_step: 0,
        max_step_reached: 0,
        started_at: nowIso(),
        skipped_at: null,
        completed_at: null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, onboarding]);

  useLayoutEffect(() => {
    if (!active) return;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-onboarding="${STEPS[step].target}"]`);
      setRect(el?.getBoundingClientRect() ?? null);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, step]);

  if (!active || !rect) return null;

  const maxReached = onboarding?.max_step_reached ?? 0;

  const goToStep = (nextStep: number) => {
    patchFlag.mutate({
      flow: "onboarding",
      patch: { current_step: nextStep, max_step_reached: Math.max(nextStep, maxReached) },
    });
  };

  const finish = () => {
    patchFlag.mutate({
      flow: "onboarding",
      patch: { status: "completed", max_step_reached: STEPS.length - 1, completed_at: nowIso() },
    });
  };

  const skip = () => {
    patchFlag.mutate({
      flow: "onboarding",
      patch: { status: "skipped", max_step_reached: Math.max(step, maxReached), skipped_at: nowIso() },
    });
  };

  return (
    <Coachmark
      targetRect={rect}
      title={STEPS[step].title}
      description={STEPS[step].description}
      step={step}
      totalSteps={STEPS.length}
      onNext={() => (step === STEPS.length - 1 ? finish() : goToStep(step + 1))}
      onPrevious={() => goToStep(Math.max(step - 1, 0))}
      onSkip={skip}
    />
  );
}
