"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui";

export function Hero() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Capture and store tracking params on landing
  useEffect(() => {
    const ref = searchParams.get("ref");
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmContent = searchParams.get("utm_content");

    // Store in localStorage so they persist when navigating to form
    if (ref) localStorage.setItem("6hops_ref", ref);
    if (utmSource) localStorage.setItem("6hops_utm_source", utmSource);
    if (utmMedium) localStorage.setItem("6hops_utm_medium", utmMedium);
    if (utmCampaign) localStorage.setItem("6hops_utm_campaign", utmCampaign);
    if (utmContent) localStorage.setItem("6hops_utm_content", utmContent);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to early access form with email as query param
    const params = email ? `?email=${encodeURIComponent(email)}` : "";
    router.push(`/early-access${params}`);
  };

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

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="enter your email"
            className="font-mono text-sm px-4 py-3 border border-neutral-300 focus:border-neutral-800 outline-none w-64 bg-white text-neutral-800 placeholder:text-neutral-400"
          />
          <Button>[ get early access ]</Button>
        </form>
      </div>
    </main>
  );
}
