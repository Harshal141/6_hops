import { describe, it, expect } from "vitest";
import type { Event } from "@sentry/nextjs";
import { scrubEvent, beTracePropagationTargets } from "./sentry";

describe("scrubEvent", () => {
  it("drops credential headers regardless of case and keeps the rest", () => {
    const event: Event = {
      request: {
        headers: {
          Authorization: "Bearer abc",
          cookie: "a=b",
          "X-Internal-Secret": "s3cret",
          "user-agent": "Mozilla/5.0",
        },
        cookies: { a: "b" },
      },
    };
    expect(scrubEvent(event).request).toEqual({ headers: { "user-agent": "Mozilla/5.0" } });
  });

  it("passes through events without a request", () => {
    const event: Event = { message: "boom" };
    expect(scrubEvent(event)).toBe(event);
  });
});

describe("beTracePropagationTargets", () => {
  const matches = (url: string) =>
    beTracePropagationTargets("https://service-hops.vercel.app").some((re) => re.test(url));

  it("matches the BE origin and its paths", () => {
    expect(matches("https://service-hops.vercel.app")).toBe(true);
    expect(matches("https://service-hops.vercel.app/auth/upsert")).toBe(true);
  });

  it("never matches third parties or a lookalike host", () => {
    expect(matches("https://www.linkedin.com/oauth/v2/accessToken")).toBe(false);
    expect(matches("https://media.licdn.com/dms/image/x")).toBe(false);
    expect(matches("https://service-hops.vercel.app.evil.com/x")).toBe(false);
    expect(matches("https://service-hopsXvercel.app/x")).toBe(false);
  });

  it("is empty when the BE URL is missing or invalid", () => {
    expect(beTracePropagationTargets(undefined)).toEqual([]);
    expect(beTracePropagationTargets("not a url")).toEqual([]);
  });
});
