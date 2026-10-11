"use client";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { SpaceshipShape, type SpaceshipModel } from "./SpaceshipShape";

type Point = [number, number];

/** A smooth curve through `points`, flat at each one, so every point sits exactly on the line. */
function smoothPath(points: Point[]) {
  const [first, ...rest] = points;
  let d = `M ${first[0]} ${first[1]}`;
  let [px, py] = first;
  for (const [x, y] of rest) {
    const mid = (x - px) / 2;
    d += ` C ${px + mid} ${py}, ${x - mid} ${y}, ${x} ${y}`;
    [px, py] = [x, y];
  }
  return d;
}

// Six hop markers between two off-screen ends: the path is "you" to "anyone".
const MAIN: Point[] = [[-60, 150], [110, 92], [290, 140], [470, 70], [660, 128], [850, 62], [1040, 118], [1260, 76]];
const HIGH: Point[] = [[-60, 46], [300, 28], [640, 54], [980, 24], [1260, 44]];

interface Flight {
  model: SpaceshipModel;
  path: Point[];
  seconds: number;
  /** Where along the path it starts, 0..1, so ships are spread out from the first frame. */
  offset: number;
  reverse?: boolean;
  scale: number;
  /** Where it parks when motion is reduced. */
  still: Point;
}

const FLIGHTS: Flight[] = [
  { model: "shuttle", path: MAIN, seconds: 34, offset: 0.12, scale: 1, still: [380, 88] },
  { model: "dart", path: MAIN, seconds: 34, offset: 0.62, scale: 0.85, still: [950, 72] },
  { model: "pod", path: HIGH, seconds: 52, offset: 0.4, reverse: true, scale: 0.7, still: [640, 26] },
];

interface HopFlightProps {
  /** Number the hop markers 1 to 6. */
  labelled?: boolean;
}

/**
 * A band of sky between sections: a dotted path through six hop markers, with
 * a few ships flying it. The art is cropped, not squashed, on narrow screens,
 * so ships keep their proportions on a phone.
 */
export function HopFlight({ labelled = true }: HopFlightProps) {
  const reducedMotion = useReducedMotion();
  const mainPath = smoothPath(MAIN);
  const highPath = smoothPath(HIGH);
  const hops = MAIN.slice(1, -1);

  return (
    <div aria-hidden className="w-full h-36 sm:h-48 text-fg">
      <svg viewBox="0 0 1200 180" preserveAspectRatio="xMidYMid slice" className="w-full h-full overflow-visible">
        <path d={mainPath} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1} strokeDasharray="2 6" />
        <path d={highPath} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="1 7" />

        {hops.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={5} fill="var(--color-surface)" stroke="currentColor" strokeWidth={1.25} />
            <circle cx={x} cy={y} r={1.6} fill="currentColor" />
            {labelled && (
              <text x={x} y={y + 22} textAnchor="middle" className="fill-fg-subtle font-mono text-[11px]">
                {i + 1}
              </text>
            )}
          </g>
        ))}

        {FLIGHTS.map((flight, i) => {
          const d = flight.path === MAIN ? mainPath : highPath;
          return (
            <g key={i} className="text-fg">
              {reducedMotion ? (
                <g transform={`translate(${flight.still[0]} ${flight.still[1]}) scale(${flight.scale})`}>
                  <SpaceshipShape model={flight.model} />
                </g>
              ) : (
                <g>
                  <animateMotion
                    dur={`${flight.seconds}s`}
                    begin={`-${flight.offset * flight.seconds}s`}
                    repeatCount="indefinite"
                    rotate={flight.reverse ? "auto-reverse" : "auto"}
                    keyPoints={flight.reverse ? "1;0" : "0;1"}
                    keyTimes="0;1"
                    calcMode="linear"
                    path={d}
                  />
                  <g transform={`scale(${flight.scale})`}>
                    <SpaceshipShape model={flight.model} />
                  </g>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
