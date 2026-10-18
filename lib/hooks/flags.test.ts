import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { FLAGS_KEY, mergeFlowPatch, patchFlagOptions, type FlowPatch, type UserFlags } from "./flags";

describe("mergeFlowPatch (mirrors the backend's two-level merge)", () => {
  it("merges an object over an object one level deep, keeping the other keys", () => {
    expect(mergeFlowPatch({ status: "in_progress", steps: { profile: "skipped" } }, { steps: { connect: "done" } })).toEqual({
      status: "in_progress",
      steps: { profile: "skipped", connect: "done" },
    });
  });

  it("replaces scalars, arrays, null, deeper objects, and an object over a non-object", () => {
    const current = { a: 1, list: [1], gone: { x: 1 }, scalar: "s", deep: { inner: { a: 1, b: 2 } } };
    expect(mergeFlowPatch(current, { a: 2, list: [2], gone: null, scalar: { now: 1 }, deep: { inner: { a: 9 } } })).toEqual({
      a: 2,
      list: [2],
      gone: null,
      scalar: { now: 1 },
      deep: { inner: { a: 9 } },
    });
  });

  it("starts from nothing when there is no flow yet", () => {
    expect(mergeFlowPatch(undefined, { steps: { invite: "done" } })).toEqual({ steps: { invite: "done" } });
  });
});

// The real mutation options against a real QueryClient, with fetch stubbed: no React, no server.
describe("patchFlagOptions", () => {
  type Pending = { body: unknown; resolve: (flags: UserFlags) => void; reject: (status: number) => void };
  let calls: Pending[];
  let qc: QueryClient;

  beforeEach(() => {
    calls = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((resolve) => {
            calls.push({
              body: JSON.parse(String(init.body)),
              resolve: (flags) => resolve(new Response(JSON.stringify(flags), { status: 200 })),
              reject: (status) => resolve(new Response(JSON.stringify({ error: "nope" }), { status })),
            });
          }),
      ),
    );
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    qc.setQueryData<UserFlags>(FLAGS_KEY, {
      onboarding: {
        status: "in_progress", current_step: 1, max_step_reached: 1, steps: {}, reminder_dismissed: false,
        started_at: null, skipped_at: null, completed_at: null,
      },
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    qc.clear();
  });

  const write = (patch: FlowPatch) => new MutationObserver(qc, patchFlagOptions(qc)).mutate(patch).catch(() => "failed");
  const onboarding = () => qc.getQueryData<UserFlags>(FLAGS_KEY)?.onboarding;
  const tick = () => new Promise((r) => setTimeout(r, 0));

  it("applies each write optimistically at once, but sends them one at a time, in order", async () => {
    const first = write({ flow: "onboarding", patch: { steps: { profile: "skipped" }, current_step: 2 } });
    const second = write({ flow: "onboarding", patch: { steps: { connect: "done" } } });
    await tick();

    expect(onboarding()).toMatchObject({ current_step: 2, steps: { profile: "skipped", connect: "done" } });
    expect(calls).toHaveLength(1); // the second waits for the first
    expect(calls[0].body).toEqual({ steps: { profile: "skipped" }, current_step: 2 });

    calls[0].resolve({ onboarding: { ...onboarding()!, steps: { profile: "skipped" } } });
    await first;
    await tick();
    expect(calls).toHaveLength(2);
    expect(calls[1].body).toEqual({ steps: { connect: "done" } });
    calls[1].resolve({ onboarding: onboarding()! });
    await second;
  });

  it("a failed write does not roll back over a later write's optimistic state", async () => {
    const invalidate = vi.spyOn(qc, "invalidateQueries");
    const first = write({ flow: "onboarding", patch: { current_step: 2 } });
    const second = write({ flow: "onboarding", patch: { steps: { connect: "done" } } });
    await tick();

    calls[0].reject(500);
    expect(await first).toBe("failed");
    // the snapshot from before the first write would have erased the second's change
    expect(onboarding()).toMatchObject({ current_step: 2, steps: { connect: "done" } });
    expect(invalidate).not.toHaveBeenCalled(); // a refetch now could also undo it

    await tick();
    calls[1].resolve({ onboarding: { ...onboarding()!, current_step: 1 } });
    await second;
    expect(invalidate).toHaveBeenCalledTimes(1); // once, after the last write settles
  });

  it("a failed write with nothing queued behind it rolls back to its snapshot, then refetches", async () => {
    const invalidate = vi.spyOn(qc, "invalidateQueries").mockResolvedValue();
    const only = write({ flow: "onboarding", patch: { steps: { profile: "done" } } });
    await tick();
    expect(onboarding()?.steps).toEqual({ profile: "done" });

    calls[0].reject(503);
    expect(await only).toBe("failed");
    expect(onboarding()?.steps).toEqual({});
    expect(invalidate).toHaveBeenCalledTimes(1);
  });
});
