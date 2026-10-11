"use client";

import { Card, Reveal } from "../ui";
import { useInView } from "@/lib/hooks/useInView";
import { useReplayable } from "@/lib/hooks/useReplayable";
import type { Feature } from "./landingContent";

interface FeatureTileProps {
  feature: Feature;
  /** The live demo, given whether it should be playing. */
  demo: (play: boolean) => React.ReactNode;
  /** `row` puts the demo beside the text, for a wide, short tile. */
  layout?: "stack" | "row";
  /** Reveal stagger, in ms. */
  delay?: number;
}

/**
 * One cell of the feature showcase: a small working picture of the feature
 * above its name. The demo plays when the tile scrolls into view and again
 * whenever the cursor comes back to it.
 */
export function FeatureTile({ feature, demo, layout = "stack", delay = 0 }: FeatureTileProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });
  const { play, runId, replay } = useReplayable(inView);
  const isRow = layout === "row";

  return (
    <Reveal delay={delay} fullHeight>
      <div ref={ref} className="h-full">
        <Card spotlight fullHeight padding="none" onPointerEnter={inView ? replay : undefined}>
          <div className={`h-full flex ${isRow ? "flex-col md:flex-row md:items-center" : "flex-col"}`}>
            <div className={`relative p-5 sm:p-6 ${isRow ? "md:order-2 md:flex-1" : "flex-1 min-h-56"}`}>
              <div key={runId} className="h-full">
                {demo(play)}
              </div>
            </div>
            <div className={`p-5 sm:p-6 border-border ${isRow ? "border-t md:border-t-0 md:border-r md:w-80 md:shrink-0" : "border-t"}`}>
              <h3 className="font-mono text-base font-semibold text-fg mb-1.5">{feature.title}</h3>
              <p className="font-mono text-sm text-fg-muted leading-relaxed">{feature.body}</p>
            </div>
          </div>
        </Card>
      </div>
    </Reveal>
  );
}
