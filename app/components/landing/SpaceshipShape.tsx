export type SpaceshipModel = "shuttle" | "dart" | "pod";

interface SpaceshipShapeProps {
  model: SpaceshipModel;
}

/**
 * Line-art ships in the app's ink: white body, one stroke weight, no colour.
 * Drawn nose-right around the origin (roughly 60 x 28 units) so an SVG motion
 * path with `rotate="auto"` points them along their direction of travel.
 * Render inside an <svg>; colour comes from `currentColor`.
 */
export function SpaceshipShape({ model }: SpaceshipShapeProps) {
  return (
    <g fill="var(--color-surface)" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
      {/* exhaust: a short dashed trail that drifts while the ship flies */}
      <path
        d="M -22 0 H -38 M -20 -3.5 H -30 M -20 3.5 H -30"
        fill="none"
        strokeDasharray="3 3"
        className="motion-safe:animate-[exhaust_0.6s_linear_infinite]"
      />
      {model === "shuttle" && (
        <>
          <path d="M -8 -6 L -16 -13 H -10 L 0 -6 M -8 6 L -16 13 H -10 L 0 6" />
          <path d="M -20 -6 H 10 Q 21 -5 25 0 Q 21 5 10 6 H -20 Z" />
          <path d="M -20 -6 V 6" />
          <circle cx={12} cy={-0.5} r={2.6} />
        </>
      )}
      {model === "dart" && (
        <>
          <path d="M -18 -10 L 24 0 L -18 10 L -11 0 Z" />
          <path d="M -11 0 H 8" />
          <path d="M 4 -2.4 L 12 0 L 4 2.4" />
        </>
      )}
      {model === "pod" && (
        <>
          <path d="M -6 -6 Q 2 -16 12 -6" />
          <ellipse cx={3} cy={0} rx={19} ry={6.5} />
          <path d="M -12 0 H 18" strokeDasharray="1.5 3.5" />
          <path d="M 3 -11 V -15" />
        </>
      )}
    </g>
  );
}
