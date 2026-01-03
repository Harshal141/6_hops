import { Suspense } from "react";
import { GridBackground, Navbar, Hero, Footer } from "./components";

function HeroFallback() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="text-center max-w-2xl">
        <p className="font-mono text-sm text-neutral-400 uppercase tracking-widest mb-4">
          coming soon
        </p>
        <h1 className="text-6xl md:text-8xl font-mono font-bold text-neutral-800 tracking-tighter mb-6">
          6 hops
        </h1>
        <p className="text-lg md:text-xl font-mono text-neutral-500 mb-12 leading-relaxed">
          discover your connection graph.
          <br />
          everyone is just 6 hops away.
        </p>
        <div className="font-mono text-sm text-neutral-400">loading...</div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <GridBackground>
      <Navbar />
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>
      <Footer />
    </GridBackground>
  );
}
