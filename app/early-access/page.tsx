"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GridBackground, Navbar, Footer } from "../components";
import { Button } from "../components/ui";

const CURIOSITY_OPTIONS = [
  { id: "networking", label: "networking / warm intros" },
  { id: "recruiting", label: "recruiting / hiring" },
  { id: "sales", label: "sales / partnership" },
  { id: "research", label: "research / visualisation" },
  { id: "curious", label: "just curious" },
];

interface FormData {
  email: string;
  curiosityReason: string;
  useCase: string;
  canEmailForFeedback: boolean;
}

interface TrackingData {
  ref: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  referrer: string;
  userAgent: string;
  timezone: string;
  language: string;
  screenResolution: string;
}

function EarlyAccessForm() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  // Capture tracking data from URL and browser
  const [trackingData, setTrackingData] = useState<TrackingData>({
    ref: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    referrer: "",
    userAgent: "",
    timezone: "",
    language: "",
    screenResolution: "",
  });

  useEffect(() => {
    // Get tracking params from URL (works with both /early-access?ref=twitter and /?ref=twitter)
    const ref = searchParams.get("ref");
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmContent = searchParams.get("utm_content");

    // Also check localStorage for params captured on landing page
    const storedRef = localStorage.getItem("6hops_ref");
    const storedUtmSource = localStorage.getItem("6hops_utm_source");
    const storedUtmMedium = localStorage.getItem("6hops_utm_medium");
    const storedUtmCampaign = localStorage.getItem("6hops_utm_campaign");
    const storedUtmContent = localStorage.getItem("6hops_utm_content");

    setTrackingData({
      ref: ref || storedRef,
      utmSource: utmSource || storedUtmSource,
      utmMedium: utmMedium || storedUtmMedium,
      utmCampaign: utmCampaign || storedUtmCampaign,
      utmContent: utmContent || storedUtmContent,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      language: navigator.language || "",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    });
  }, [searchParams]);

  const [formData, setFormData] = useState<FormData>({
    email: prefillEmail,
    curiosityReason: "",
    useCase: "",
    canEmailForFeedback: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email) {
      setError("Email is required");
      return;
    }

    if (!formData.curiosityReason) {
      setError("Please select what made you curious");
      return;
    }

    setSubmitting(true);

    // Request body that will be sent to backend
    const requestBody = {
      email: formData.email,
      curiosityReason: formData.curiosityReason,
      useCase: formData.useCase || null,
      canEmailForFeedback: formData.canEmailForFeedback,
      submittedAt: new Date().toISOString(),
      // Tracking & attribution data
      tracking: {
        ref: trackingData.ref,
        utmSource: trackingData.utmSource,
        utmMedium: trackingData.utmMedium,
        utmCampaign: trackingData.utmCampaign,
        utmContent: trackingData.utmContent,
        referrer: trackingData.referrer,
        userAgent: trackingData.userAgent,
        timezone: trackingData.timezone,
        language: trackingData.language,
        screenResolution: trackingData.screenResolution,
      },
    };

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <GridBackground>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">&#10003;</span>
            </div>
            <h1 className="text-3xl font-mono font-bold text-neutral-800 mb-4">
              you&apos;re on the list!
            </h1>
            <p className="font-mono text-neutral-500 mb-8">
              thank you for your interest in 6 hops.
              <br />
              we&apos;ll reach out when we&apos;re ready.
            </p>
            <a
              href="/"
              className="font-mono text-sm text-neutral-600 hover:text-neutral-800 underline"
            >
              back to home
            </a>
          </div>
        </main>
        <Footer />
      </GridBackground>
    );
  }

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <p className="font-mono text-sm text-neutral-400 uppercase tracking-widest mb-2">
              early access
            </p>
            <h1 className="text-3xl font-mono font-bold text-neutral-800 mb-2">
              join the waitlist
            </h1>
            <p className="font-mono text-sm text-neutral-500">
              be the first to discover your connection graph
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-mono text-sm text-neutral-600 mb-2">
                email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                required
                className="font-mono text-sm px-4 py-3 border border-neutral-300 focus:border-neutral-800 outline-none w-full bg-white text-neutral-800 placeholder:text-neutral-400"
              />
            </div>

            {/* What made you curious */}
            <div>
              <label className="block font-mono text-sm text-neutral-600 mb-3">
                what made you curious? <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {CURIOSITY_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                      formData.curiosityReason === option.id
                        ? "border-neutral-800 bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="curiosityReason"
                      value={option.id}
                      checked={formData.curiosityReason === option.id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          curiosityReason: e.target.value,
                        })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.curiosityReason === option.id
                          ? "border-neutral-800"
                          : "border-neutral-300"
                      }`}
                    >
                      {formData.curiosityReason === option.id && (
                        <div className="w-2 h-2 rounded-full bg-neutral-800" />
                      )}
                    </div>
                    <span className="font-mono text-sm text-neutral-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Use case */}
            <div>
              <label className="block font-mono text-sm text-neutral-600 mb-2">
                what would you want to use this for?{" "}
                <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                value={formData.useCase}
                onChange={(e) =>
                  setFormData({ ...formData, useCase: e.target.value })
                }
                placeholder="1-2 lines about your use case..."
                maxLength={200}
                rows={2}
                className="font-mono text-sm px-4 py-3 border border-neutral-300 focus:border-neutral-800 outline-none w-full bg-white text-neutral-800 placeholder:text-neutral-400 resize-none"
              />
              <p className="font-mono text-xs text-neutral-400 mt-1 text-right">
                {formData.useCase.length}/200
              </p>
            </div>

            {/* Email for feedback checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.canEmailForFeedback}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        canEmailForFeedback: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                      formData.canEmailForFeedback
                        ? "border-neutral-800 bg-neutral-800"
                        : "border-neutral-300"
                    }`}
                  >
                    {formData.canEmailForFeedback && (
                      <span className="text-white text-xs">&#10003;</span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-sm text-neutral-600">
                  can we email you for feedback?
                </span>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <p className="font-mono text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <Button>
                {submitting ? "[ submitting... ]" : "[ join waitlist ]"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}

function LoadingFallback() {
  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-8 w-full max-w-md">
          <div className="text-center">
            <p className="font-mono text-sm text-neutral-400">loading...</p>
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}

export default function EarlyAccess() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EarlyAccessForm />
    </Suspense>
  );
}