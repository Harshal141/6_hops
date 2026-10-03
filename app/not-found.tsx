import { GridBackground, Navbar, Footer, Button } from "./components";

export default function NotFound() {
  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6">
        <span className="font-mono text-xs text-neutral-400 tracking-widest">Error 404</span>
        <h1 className="font-mono text-7xl sm:text-9xl font-bold text-neutral-800 tracking-tighter">
          404
        </h1>
        <p className="font-mono text-sm sm:text-base text-neutral-500 max-w-sm leading-relaxed">
          This node doesn&apos;t exist in the graph.
        </p>
        <Button href="/">[ Back to home ]</Button>
      </main>
      <Footer />
    </GridBackground>
  );
}
