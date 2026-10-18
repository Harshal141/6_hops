"use client";

import { useEffect, useRef } from "react";

interface StepHeadingProps {
  title: string;
  lead: string;
  /** A tag above the title, such as the AI badge. */
  eyebrow?: React.ReactNode;
}

/**
 * The step's h1 and lead line. Takes focus when the step appears, so moving between steps
 * announces the new one instead of leaving focus on a button that no longer exists.
 */
export function StepHeading({ title, lead, eyebrow }: StepHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-col gap-2 sm:gap-2.5">
      {eyebrow}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-[22px] sm:text-[28px] font-bold tracking-tight leading-tight text-fg outline-none"
      >
        {title}
      </h1>
      <p className="text-[13px] sm:text-sm text-fg-body">{lead}</p>
    </div>
  );
}
