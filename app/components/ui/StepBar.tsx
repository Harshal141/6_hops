interface StepBarProps {
  /** Brand purple when filled, the border grey when not. */
  filled: boolean;
  /** `full` stretches to its cell (a stepper); `mini` is a short fixed segment (a compact strip). */
  size?: "full" | "mini";
}

/**
 * One segment of a progress strip. Every progress bar in the app is built from this, so a
 * stepper and a reminder can never show two different purples or two different greys.
 */
export function StepBar({ filled, size = "full" }: StepBarProps) {
  return (
    <span
      aria-hidden
      className={`block h-[3px] transition-colors ${size === "mini" ? "w-3.5 sm:w-[18px]" : "w-full"}
                  ${filled ? "bg-accent" : "bg-neutral-200"}`}
    />
  );
}
