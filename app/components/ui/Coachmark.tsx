"use client";

import { createPortal } from "react-dom";
import { Button } from "./Button";

interface CoachmarkProps {
  /** Viewport-relative rect of the element being highlighted. */
  targetRect: DOMRect;
  title: string;
  description: string;
  /** 0-based index of the current step. */
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

const PAD = 8;
const CALLOUT_WIDTH = 288;

/**
 * A single-target spotlight step: dims everything except `targetRect` (via an
 * oversized box-shadow "cutout" rather than clip-path, so it works regardless
 * of the target's shape) and anchors a callout with Previous / Skip / Next
 * controls near it. Domain-free — the steps, copy, and persistence are owned
 * by whatever tour composes this.
 */
export function Coachmark({
  targetRect,
  title,
  description,
  step,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
}: CoachmarkProps) {
  if (typeof document === "undefined") return null;

  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  const placeBelow =
    window.innerHeight - targetRect.bottom > 220 || targetRect.top < 220;
  const left = Math.min(
    Math.max(targetRect.left + targetRect.width / 2 - CALLOUT_WIDTH / 2, 12),
    window.innerWidth - CALLOUT_WIDTH - 12,
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[110]"
      role="dialog"
      aria-modal="true"
      aria-label={`Onboarding step ${step + 1} of ${totalSteps}`}
    >
      {/* The "hole": a box the size of the target, whose huge box-shadow dims
          everything else on the page in one paint. */}
      <div
        className="absolute rounded-md ring-2 ring-white pointer-events-none transition-all duration-200"
        style={{
          top: targetRect.top - PAD,
          left: targetRect.left - PAD,
          width: targetRect.width + PAD * 2,
          height: targetRect.height + PAD * 2,
          boxShadow: "0 0 0 9999px rgba(10, 10, 10, 0.65)",
        }}
      />

      <div
        className="absolute bg-white border border-neutral-200 shadow-2xl p-4 font-mono transition-all duration-200"
        style={{
          width: CALLOUT_WIDTH,
          left,
          top: placeBelow ? targetRect.bottom + PAD * 2 : undefined,
          bottom: placeBelow ? undefined : window.innerHeight - targetRect.top + PAD * 2,
        }}
      >
        <div className="text-[10px] text-neutral-400 mb-1">
          {step + 1} / {totalSteps}
        </div>
        <h4 className="text-sm font-semibold text-neutral-800 mb-1">{title}</h4>
        <p className="text-xs text-neutral-600 mb-4">{description}</p>

        <div className="flex justify-end items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            skip
          </Button>
          {!isFirst && (
            <Button variant="ghost" size="sm" onClick={onPrevious}>
              previous
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onNext}>
            {isLast ? "done" : "next"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
