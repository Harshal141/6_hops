"use client";

import { GridBackground, Navbar, Footer } from "../components";

export default function Demo() {
  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="text-center max-w-4xl w-full">
          <p className="font-mono text-sm text-neutral-400 uppercase tracking-widest mb-4">
            see it in action
          </p>
          <h1 className="text-4xl md:text-6xl font-mono font-bold text-neutral-800 tracking-tighter mb-8">
            demo
          </h1>

          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 md:p-8">
            <video
              controls
              autoPlay
              muted
              playsInline
              className="w-full max-w-3xl mx-auto"
              poster=""
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <p className="font-mono text-sm text-neutral-500 mt-8">
            discover how everyone is just 6 hops away
          </p>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
