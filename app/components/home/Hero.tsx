import { Button } from "../ui";

export function Hero() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-mono font-bold text-neutral-800 tracking-tighter mb-4 sm:mb-6">
          6 hops
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-mono text-neutral-500 mb-8 md:mb-12 leading-relaxed">
          discover your connection graph.
          <br />
          everyone is just 6 hops away.
        </p>
        <Button href="/dashboard">[ start discovery ]</Button>
      </div>
    </main>
  );
}
