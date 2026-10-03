"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../ui";

const LINES = ["Reading your PDF", "Pulling out your experience", "Matching your skills", "Almost there"];
const LINE_MS = 4000;

/** The processing step. The rotating line is decoration; the modal title already announces the step. */
export function ImportProgress() {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const rotate = setInterval(() => setLine((current) => Math.min(current + 1, LINES.length - 1)), LINE_MS);
    return () => clearInterval(rotate);
  }, []);

  return (
    <div aria-busy="true" className="flex flex-col items-center gap-3 py-10 text-center font-mono">
      <Spinner />
      <p aria-hidden className="text-sm text-fg-body">
        {LINES[line]}
      </p>
      <p className="text-xs text-fg-subtle">Usually 10 to 20 seconds</p>
    </div>
  );
}
