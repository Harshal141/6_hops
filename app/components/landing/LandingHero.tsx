"use client";

import { useState } from "react";
import { Navbar } from "../layout";
import { NetworkBackdrop } from "./NetworkBackdrop";
import { HeroConsole } from "./HeroConsole";
import type { SampleNetwork } from "@/lib/utils/sampleNetwork";

/** Full-height first screen: the nav and a glass readout floating over the sample network. */
export function LandingHero() {
  const [stats, setStats] = useState<SampleNetwork["stats"] | null>(null);

  return (
    <div className="relative min-h-dvh flex flex-col overflow-hidden">
      <NetworkBackdrop onStats={setStats} offsetRight />
      <Navbar />

      <div className="relative flex-1 flex items-end sm:items-center justify-center lg:justify-start px-4 sm:px-8 lg:pl-[8vw] pt-[28vh] pb-6 sm:py-10">
        <HeroConsole stats={stats} />
      </div>
    </div>
  );
}
