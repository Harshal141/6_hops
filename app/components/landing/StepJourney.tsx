"use client";

import { Card, Tilt } from "../ui";
import { useInView } from "@/lib/hooks/useInView";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";
import { reachedStep } from "@/lib/utils/scrollProgress";
import { SpaceshipShape } from "./SpaceshipShape";
import { IntroDemo, NoteDemo, SignInDemo } from "./demos";
import { PEOPLE, type Feature } from "./landingContent";

// step 2 shows a different request from the features section, so the two do not repeat
function RequestStepDemo({ play }: { play: boolean }) {
  return <NoteDemo play={play} person={PEOPLE.priya} note="We ran the design guild together for two years." />;
}

const STEP_DEMOS = [SignInDemo, RequestStepDemo, IntroDemo];

interface StepJourneyProps {
  items: Feature[];
}

/**
 * How it works, driven by scroll: a ship flies down the rail as you read,
 * each step lights up when it arrives, and the panel beside the steps plays
 * that step. Every step is the same height, so "the ship is at step i" is
 * just progress crossing i / count.
 */
export function StepJourney({ items }: StepJourneyProps) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>(0.55);
  const count = items.length;
  const reached = reachedStep(progress, count);
  const active = Math.max(0, reached);
  // the rail runs from the first marker to the last, which is (count - 1) / count of the column
  const railEnd = (count - 1) / count;
  const shipAt = Math.min(progress, railEnd);

  return (
    <div ref={ref} className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-16">
      <div className="relative">
        <div aria-hidden className="absolute left-[11px] top-3 w-0" style={{ height: `${railEnd * 100}%` }}>
          <span className="absolute inset-y-0 border-l border-dashed border-fg-subtle" />
          <span className="absolute top-0 border-l border-fg transition-[height] duration-200 ease-out"
                style={{ height: `${(shipAt / railEnd) * 100}%` }} />
        </div>

        <div aria-hidden className="absolute z-10 left-[11px] transition-[top] duration-200 ease-out"
             style={{ top: `calc(${shipAt * 100}% + 0.75rem)` }}>
          <svg viewBox="-40 -20 70 40" className="w-12 h-8 -translate-x-1/2 -translate-y-1/2 rotate-90 overflow-visible text-fg">
            <SpaceshipShape model="shuttle" />
          </svg>
        </div>

        <ol>
          {items.map((item, i) => {
            const isReached = i <= reached;
            return (
              <li key={item.title} className="grid grid-cols-[1.5rem_1fr] gap-x-5 sm:gap-x-8 pb-12 lg:pb-0 lg:min-h-[48vh]">
                <span
                  aria-hidden
                  className={`relative z-20 mt-1 w-6 h-6 border flex items-center justify-center font-mono text-[10px] transition-colors duration-300
                              ${isReached ? "bg-fg border-fg text-surface" : "bg-surface border-fg-subtle text-fg-muted"}`}
                >
                  {i + 1}
                </span>
                <div className={`max-w-md transition-opacity duration-500 ${isReached ? "opacity-100" : "opacity-60"}`}>
                  <p className="font-mono text-[11px] text-fg-subtle mb-1">Step {i + 1} of {count}</p>
                  <h3 className="font-mono text-lg sm:text-xl font-semibold text-fg mb-2">{item.title}</h3>
                  <p className="font-mono text-sm text-fg-muted leading-relaxed">{item.body}</p>
                  <div className="lg:hidden mt-6">
                    <InlineStepDemo index={i} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* desktop: one stage that follows you down, playing the step you are on */}
      <div className="hidden lg:block">
        <div className="sticky top-[20vh] h-[380px]">
          <Tilt>
            <Card spotlight fullHeight offset padding="none" header={<span>Step {active + 1} of {count}</span>}>
              <div className="relative h-full">
                {STEP_DEMOS.map((Demo, i) => (
                  <div
                    key={i}
                    aria-hidden={i !== active}
                    className={`absolute inset-0 p-8 flex flex-col justify-center transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  >
                    <Demo play={i <= reached} />
                  </div>
                ))}
              </div>
            </Card>
          </Tilt>
        </div>
      </div>
    </div>
  );
}

/** Phones have no room for the side stage, so each step carries its own demo, played when seen. */
function InlineStepDemo({ index }: { index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.5 });
  const Demo = STEP_DEMOS[index];
  return (
    <div ref={ref}>
      <Card spotlight>
        <div className="min-h-64 flex">
          <div className="flex-1">
            <Demo play={inView} />
          </div>
        </div>
      </Card>
    </div>
  );
}
