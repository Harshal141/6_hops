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

          {/* About Section */}
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-6 md:p-10 mt-12 text-left">
            <h2 className="font-mono text-2xl md:text-3xl font-bold text-neutral-800 mb-6">
              about
            </h2>

            <div className="space-y-6 font-mono text-sm md:text-base text-neutral-600 leading-relaxed">
              <p>
                I was curious about the concept of{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Six_degrees_of_separation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-800 underline hover:text-neutral-600"
                >
                  six degrees of separation
                </a>{" "}
                 the idea that we are all connected to each other in some way.
              </p>

              <p>
                I built this project to visualize exactly that. A place where people can connect,
                create strong connections, and use their network to its full capacity. The experiment
                focuses on <span className="text-neutral-800 font-medium">strong connections only</span> 
                not the weak ties we know in life but don&apos;t talk much with.
              </p>

              <p>
                Here you can visualize your connections in a graph, as well as search for specific
                people who are good at something you want to learn about or connect with.
              </p>

              <p>
                This concept is really powerful in rural places, communities, etc. where people are
                well connected with each other. If you want to find someone who can help you start
                a restaurant business or guide you about it  you can search your connections even
                if you&apos;re in the IT industry or anything else. It doesn&apos;t restrict you to the
                connections you have directly; it helps you leverage the{" "}
                <span className="text-neutral-800 font-medium">high-quality connections your friends have</span>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
