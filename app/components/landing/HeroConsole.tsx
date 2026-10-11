import { Button, Card, StatTile } from "../ui";
import { HERO } from "./landingContent";
import type { SampleNetwork } from "@/lib/utils/sampleNetwork";

interface HeroConsoleProps {
  stats: SampleNetwork["stats"] | null;
}

/** Variation B: a left-aligned glass readout of the network behind it. */
export function HeroConsole({ stats }: HeroConsoleProps) {
  return (
    <div className="w-full max-w-xl">
      <Card
        tone="glass"
        padding="lg"
        offset
        header="Network"
      >
        <h1 className="font-mono font-bold text-fg tracking-tighter text-3xl sm:text-5xl mb-4">
          {HERO.title}
          <span aria-hidden className="inline-block w-[0.5em] h-[0.9em] ml-1 align-[-0.08em] bg-fg motion-safe:animate-[caret-blink_1.1s_steps(1)_infinite]" />
        </h1>
        <p className="font-mono text-sm text-fg-body leading-relaxed mb-6">{HERO.lead}</p>

        {/* phones keep the first row only, so the network behind still shows */}
        <div className="grid grid-cols-2 gap-2 mb-6 sm:mb-8">
          <StatTile label="People" count={stats?.people ?? 0} />
          <StatTile label="Connections" count={stats?.connections ?? 0} />
          <div className="hidden sm:block">
            <StatTile label="Not connected yet" count={stats?.isolated ?? 0} />
          </div>
          <div className="hidden sm:block">
            <StatTile label="Max hops" count={6} />
          </div>
        </div>

        <div className="flex flex-col items-center sm:flex-row gap-2 sm:gap-4">
          <Button href={HERO.ctaHref}>{HERO.cta}</Button>
          <Button href={HERO.secondaryHref} variant="ghost" size="lg">
            {HERO.secondary}
          </Button>
        </div>
      </Card>
    </div>
  );
}
