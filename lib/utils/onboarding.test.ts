import { describe, it, expect } from "vitest";
import type { OnboardingFlow } from "@/lib/hooks/flags";
import {
  clampStep,
  completePatch,
  countLabel,
  dashboardHref,
  dismissReminderPatch,
  displayLink,
  firstIncompleteStep,
  firstName,
  goToStepPatch,
  inviteShareUrls,
  isOnboardingFlow,
  joinNames,
  leaveStepPatch,
  nextStep,
  parseStepParam,
  prevStep,
  progressCount,
  resumeStep,
  shouldRouteToOnboarding,
  showSetupReminder,
  skipSetupPatch,
  startPatch,
  stepKeyAt,
  stepResultPatch,
} from "./onboarding";

const NOW = "2026-10-17T10:00:00.000Z";

function flow(overrides: Partial<OnboardingFlow> = {}): OnboardingFlow {
  return {
    status: "not_started",
    current_step: 0,
    max_step_reached: 0,
    steps: {},
    reminder_dismissed: false,
    started_at: null,
    skipped_at: null,
    completed_at: null,
    ...overrides,
  };
}

describe("isOnboardingFlow / shouldRouteToOnboarding", () => {
  it("routes only a freshly seeded signup", () => {
    expect(shouldRouteToOnboarding(flow())).toBe(true);
    expect(shouldRouteToOnboarding(flow({ status: "in_progress" }))).toBe(false);
    expect(shouldRouteToOnboarding(flow({ status: "skipped" }))).toBe(false);
    expect(shouldRouteToOnboarding(flow({ status: "completed" }))).toBe(false);
  });

  it("never routes an existing user with no flow or a leftover from the old tour", () => {
    expect(shouldRouteToOnboarding(undefined)).toBe(false);
    expect(shouldRouteToOnboarding(null)).toBe(false);
    expect(shouldRouteToOnboarding({})).toBe(false);
    // the retired tour wrote status and steps counters, but never a `steps` object
    expect(shouldRouteToOnboarding({ status: "not_started", current_step: 0, max_step_reached: 0 })).toBe(false);
    expect(isOnboardingFlow({ status: "in_progress", steps: [] })).toBe(false);
    expect(isOnboardingFlow({ status: "bogus", steps: {} })).toBe(false);
  });
});

describe("step navigation", () => {
  it("clamps to welcome..done", () => {
    expect(clampStep(-3)).toBe(0);
    expect(clampStep(9)).toBe(4);
    expect(clampStep(Number.NaN)).toBe(0);
    expect(nextStep(4)).toBe(4);
    expect(prevStep(0)).toBe(0);
    expect(nextStep(1)).toBe(2);
  });

  it("maps screens to tasks", () => {
    expect(stepKeyAt(0)).toBeNull();
    expect(stepKeyAt(1)).toBe("profile");
    expect(stepKeyAt(3)).toBe("invite");
    expect(stepKeyAt(4)).toBeNull();
  });

  it("parses ?step= as a task name or a screen number", () => {
    expect(parseStepParam("connect")).toBe(2);
    expect(parseStepParam("3")).toBe(3);
    expect(parseStepParam("0")).toBe(0);
    expect(parseStepParam("7")).toBeNull();
    expect(parseStepParam("nope")).toBeNull();
    expect(parseStepParam(null)).toBeNull();
  });
});

describe("resumeStep", () => {
  it("prefers an explicit step", () => {
    expect(resumeStep(flow({ current_step: 1 }), 3)).toBe(3);
  });

  it("returns to where an in-progress user left off", () => {
    expect(resumeStep(flow({ status: "in_progress", current_step: 2 }), null)).toBe(2);
  });

  it("starts a skipped flow at the first unfinished task", () => {
    expect(resumeStep(flow({ status: "skipped", current_step: 0, steps: { profile: "done" } }), null)).toBe(2);
    expect(
      resumeStep(flow({ status: "completed", steps: { profile: "done", connect: "done", invite: "done" } }), null),
    ).toBe(4);
  });

  it("opens on welcome without a flow", () => {
    expect(resumeStep(undefined, null)).toBe(0);
  });
});

describe("progress and the reminder", () => {
  it("counts only done tasks", () => {
    expect(progressCount({ profile: "done", connect: "skipped" })).toBe(1);
    expect(progressCount(undefined)).toBe(0);
  });

  it("finds the first task not done, treating skipped as not done", () => {
    expect(firstIncompleteStep({ profile: "done", connect: "skipped" })).toBe("connect");
    expect(firstIncompleteStep({ profile: "done", connect: "done", invite: "done" })).toBeNull();
    expect(firstIncompleteStep({})).toBe("profile");
  });

  it("shows for any opened flow with a task not done: in progress, skipped or completed", () => {
    expect(showSetupReminder(flow({ status: "in_progress" }))).toBe(true);
    expect(showSetupReminder(flow({ status: "skipped", steps: { profile: "done" } }))).toBe(true);
    // finished with every task skipped ("Go to dashboard"): the tasks are still there to do
    expect(
      showSetupReminder(flow({ status: "completed", steps: { profile: "skipped", connect: "skipped", invite: "skipped" } })),
    ).toBe(true);
    expect(showSetupReminder(flow({ status: "completed", steps: { profile: "skipped", connect: "done", invite: "done" } }))).toBe(true);
  });

  it("hides when not started, dismissed, all three done, or not a current flow", () => {
    expect(showSetupReminder(flow())).toBe(false);
    expect(showSetupReminder(flow({ status: "skipped", reminder_dismissed: true }))).toBe(false);
    expect(showSetupReminder(flow({ status: "completed", reminder_dismissed: true }))).toBe(false);
    expect(
      showSetupReminder(flow({ status: "skipped", steps: { profile: "done", connect: "done", invite: "done" } })),
    ).toBe(false);
    expect(
      showSetupReminder(flow({ status: "completed", steps: { profile: "done", connect: "done", invite: "done" } })),
    ).toBe(false);
    expect(showSetupReminder({ status: "skipped", current_step: 1 })).toBe(false);
    expect(showSetupReminder(undefined)).toBe(false);
  });
});

describe("patches", () => {
  it("starts a fresh signup", () => {
    expect(startPatch(flow(), 0, NOW)).toEqual({
      status: "in_progress",
      current_step: 0,
      max_step_reached: 0,
      started_at: NOW,
    });
  });

  it("writes a whole flow when none exists", () => {
    expect(startPatch(undefined, 2, NOW)).toEqual({
      status: "in_progress",
      current_step: 2,
      max_step_reached: 2,
      steps: {},
      reminder_dismissed: false,
      started_at: NOW,
      skipped_at: null,
      completed_at: null,
    });
  });

  it("resumes a skipped flow without losing its first start time", () => {
    const patch = startPatch(flow({ status: "skipped", started_at: "earlier", max_step_reached: 3 }), 2, NOW);
    expect(patch).toEqual({ status: "in_progress", current_step: 2, max_step_reached: 3, started_at: "earlier" });
  });

  it("leaves an in-progress or completed flow alone", () => {
    expect(startPatch(flow({ status: "in_progress" }), 1, NOW)).toBeNull();
    expect(startPatch(flow({ status: "completed" }), 1, NOW)).toBeNull();
  });

  it("tracks the furthest step reached", () => {
    expect(goToStepPatch(flow({ max_step_reached: 3 }), 1)).toEqual({ current_step: 1, max_step_reached: 3 });
    expect(goToStepPatch(flow({ max_step_reached: 1 }), 2)).toEqual({ current_step: 2, max_step_reached: 2 });
  });

  it("sends only the task it changes, and never downgrades done", () => {
    const base = flow({ steps: { profile: "done" } });
    expect(stepResultPatch(base, "connect", "done")).toEqual({ steps: { connect: "done" } });
    expect(stepResultPatch(base, "profile", "skipped")).toEqual({ steps: { profile: "done" } });
    expect(stepResultPatch(undefined, "invite", "skipped")).toEqual({ steps: { invite: "skipped" } });
  });

  it("marks a task skipped when leaving it undone, and advances", () => {
    expect(leaveStepPatch(flow({ max_step_reached: 1 }), 1)).toEqual({
      steps: { profile: "skipped" },
      current_step: 2,
      max_step_reached: 2,
    });
    expect(leaveStepPatch(flow({ steps: { profile: "skipped", invite: "done" }, max_step_reached: 3 }), 3)).toEqual({
      steps: { invite: "done" },
      current_step: 4,
      max_step_reached: 4,
    });
    // welcome has no task to record
    expect(leaveStepPatch(flow(), 0)).toEqual({ current_step: 1, max_step_reached: 1 });
  });

  it("skips and completes setup", () => {
    expect(skipSetupPatch(flow({ max_step_reached: 2 }), 1, NOW)).toEqual({
      status: "skipped",
      skipped_at: NOW,
      current_step: 1,
      max_step_reached: 2,
    });
    // a completed flow is never downgraded to skipped: only the position is saved
    expect(skipSetupPatch(flow({ status: "completed", max_step_reached: 4 }), 2, NOW)).toEqual({
      current_step: 2,
      max_step_reached: 4,
    });
    expect(skipSetupPatch(undefined, 0, NOW)).toEqual({
      status: "skipped",
      skipped_at: NOW,
      current_step: 0,
      max_step_reached: 0,
    });
    expect(completePatch(NOW)).toEqual({
      status: "completed",
      completed_at: NOW,
      current_step: 4,
      max_step_reached: 4,
    });
    expect(dismissReminderPatch()).toEqual({ reminder_dismissed: true });
  });
});

describe("dashboardHref", () => {
  it("adds the escape hatch only when leaving setup wasn't saved", () => {
    expect(dashboardHref(true)).toBe("/dashboard");
    expect(dashboardHref(false)).toBe("/dashboard?setup=left");
  });
});

describe("copy helpers", () => {
  it("takes a first name", () => {
    expect(firstName("  Ravi Iyer ")).toBe("Ravi");
    expect(firstName(null)).toBe("");
  });

  it("pluralises counts", () => {
    expect(countLabel(1, "connection")).toBe("1 connection");
    expect(countLabel(0, "role")).toBe("0 roles");
    expect(countLabel(48, "connection")).toBe("48 connections");
  });

  it("joins names readably", () => {
    expect(joinNames([])).toBe("");
    expect(joinNames(["Ravi"])).toBe("Ravi");
    expect(joinNames(["Ravi", "Arjun"])).toBe("Ravi and Arjun");
    expect(joinNames(["Ravi", "Arjun", "Priya", "Leo"])).toBe("Ravi, Arjun and 2 more");
    expect(joinNames(["Ravi", " "])).toBe("Ravi");
    // two people with one name are two people: de-duplicating is by id, in the caller
    expect(joinNames(["Ravi", "Ravi"])).toBe("Ravi and Ravi");
  });

  it("shows a link without its protocol", () => {
    expect(displayLink("https://www.6-hops.com/invite/maya-1")).toBe("www.6-hops.com/invite/maya-1");
  });

  it("builds share URLs that carry the link", () => {
    const link = "https://www.6-hops.com/invite/maya-1";
    const urls = inviteShareUrls(link);
    expect(urls.whatsapp.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(urls.whatsapp)).toContain(link);
    expect(urls.linkedin).toBe(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    );
    expect(urls.email.startsWith("mailto:?subject=")).toBe(true);
    expect(decodeURIComponent(urls.email)).toContain(link);
  });
});
