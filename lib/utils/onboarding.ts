import type {
  OnboardingFlow,
  OnboardingStatus,
  OnboardingStepKey,
  OnboardingStepResult,
} from "@/lib/hooks/flags";

/**
 * The onboarding flow as pure functions: which screen to show, what each action writes
 * to the `onboarding` flag, and when the dashboard reminder appears. Components call
 * these and send the result through `usePatchFlag`; nothing here touches the network.
 *
 *   0 welcome ─► 1 profile ─► 2 connect ─► 3 invite ─► 4 done
 *
 * The PATCH merges object-valued fields one level deep (service_hops flagService.patchFlow),
 * so a patch to `steps` carries only the task it changes and never drops another's result.
 */

export const STEP_KEYS: readonly OnboardingStepKey[] = ["profile", "connect", "invite"];

export const WELCOME_STEP = 0;
export const DONE_STEP = 4;

/**
 * Appended to /dashboard when leaving setup couldn't be saved: the dashboard's gate
 * then lets the user in instead of sending a still-`not_started` flow back to setup.
 */
export const LEFT_ONBOARDING_PARAM = "setup";

/** Where leaving setup lands: plain /dashboard, or the escape hatch when the write failed. */
export function dashboardHref(saved: boolean): string {
  return saved ? "/dashboard" : `/dashboard?${LEFT_ONBOARDING_PARAM}=left`;
}

export type OnboardingPatch = Partial<OnboardingFlow>;

const STATUSES: readonly OnboardingStatus[] = ["not_started", "in_progress", "skipped", "completed"];

/**
 * True only for a flow written by the current onboarding (it has a `steps` object).
 * Users from before it have no flow, or a leftover from the retired tour without
 * `steps`, and must never be routed into setup or shown its reminder.
 */
export function isOnboardingFlow(flow: unknown): flow is OnboardingFlow {
  if (!flow || typeof flow !== "object") return false;
  const { status, steps } = flow as { status?: unknown; steps?: unknown };
  return (
    STATUSES.includes(status as OnboardingStatus) &&
    !!steps &&
    typeof steps === "object" &&
    !Array.isArray(steps)
  );
}

/** Only a brand-new signup, seeded `not_started`, is sent into setup automatically. */
export function shouldRouteToOnboarding(flow: unknown): boolean {
  return isOnboardingFlow(flow) && flow.status === "not_started";
}

export function clampStep(step: number): number {
  if (!Number.isFinite(step)) return WELCOME_STEP;
  return Math.min(DONE_STEP, Math.max(WELCOME_STEP, Math.trunc(step)));
}

export const nextStep = (step: number) => clampStep(step + 1);
export const prevStep = (step: number) => clampStep(step - 1);

/** The task a screen belongs to, or null for welcome and done. */
export function stepKeyAt(step: number): OnboardingStepKey | null {
  return STEP_KEYS[step - 1] ?? null;
}

export function stepIndexOf(key: OnboardingStepKey): number {
  return STEP_KEYS.indexOf(key) + 1;
}

/** `?step=` accepts a task name ("connect") or a screen number ("2"). Anything else is ignored. */
export function parseStepParam(param: string | null | undefined): number | null {
  if (!param) return null;
  const byKey = STEP_KEYS.indexOf(param as OnboardingStepKey);
  if (byKey >= 0) return byKey + 1;
  if (!/^\d+$/.test(param)) return null;
  const index = Number(param);
  return index >= WELCOME_STEP && index <= DONE_STEP ? index : null;
}

export function progressCount(steps: OnboardingFlow["steps"] | undefined): number {
  return STEP_KEYS.filter((key) => steps?.[key] === "done").length;
}

/** The first task not done yet (skipped counts as not done), or null when all three are. */
export function firstIncompleteStep(steps: OnboardingFlow["steps"] | undefined): OnboardingStepKey | null {
  return STEP_KEYS.find((key) => steps?.[key] !== "done") ?? null;
}

/** Where to open the flow: an explicit `?step=` wins, then wherever the user left off. */
export function resumeStep(flow: OnboardingFlow | undefined, requested: number | null): number {
  if (requested !== null) return clampStep(requested);
  if (!isOnboardingFlow(flow)) return WELCOME_STEP;
  // a finished flow reopened without a target starts at the first unfinished task
  if (flow.status === "completed" || flow.status === "skipped") {
    const key = firstIncompleteStep(flow.steps);
    return key ? stepIndexOf(key) : DONE_STEP;
  }
  return clampStep(flow.current_step ?? WELCOME_STEP);
}

/**
 * The "Finish setup" strip: any flow the user has opened (so not `not_started`) with a task
 * still not done, until they close it. That includes a completed flow: finishing with every
 * task skipped still leaves the tasks to do.
 */
export function showSetupReminder(flow: unknown): boolean {
  if (!isOnboardingFlow(flow)) return false;
  if (flow.status === "not_started") return false;
  if (flow.reminder_dismissed) return false;
  return progressCount(flow.steps) < STEP_KEYS.length;
}

const maxReached = (flow: OnboardingFlow | undefined, step: number) =>
  Math.max(isOnboardingFlow(flow) ? flow.max_step_reached ?? 0 : 0, step);

/**
 * Opening the flow. A fresh signup (or someone who skipped and came back) becomes
 * `in_progress`; a flow that doesn't exist yet is written whole so it's well formed.
 * Returns null when there is nothing to change.
 */
export function startPatch(flow: OnboardingFlow | undefined, step: number, now: string): OnboardingPatch | null {
  if (!isOnboardingFlow(flow)) {
    return {
      status: "in_progress",
      current_step: step,
      max_step_reached: step,
      steps: {},
      reminder_dismissed: false,
      started_at: now,
      skipped_at: null,
      completed_at: null,
    };
  }
  if (flow.status === "in_progress" || flow.status === "completed") return null;
  return {
    status: "in_progress",
    current_step: step,
    max_step_reached: maxReached(flow, step),
    started_at: flow.started_at ?? now,
  };
}

export function goToStepPatch(flow: OnboardingFlow | undefined, step: number): OnboardingPatch {
  const target = clampStep(step);
  return { current_step: target, max_step_reached: maxReached(flow, target) };
}

/**
 * Records one task's outcome, sending only that task: the PATCH merges it into `steps`.
 * "done" is never downgraded to "skipped" by a later skip.
 */
export function stepResultPatch(
  flow: OnboardingFlow | undefined,
  key: OnboardingStepKey,
  result: OnboardingStepResult,
): OnboardingPatch {
  const current = isOnboardingFlow(flow) ? flow.steps[key] : undefined;
  return { steps: { [key]: current === "done" ? "done" : result } };
}

/**
 * Leaving a task screen forward ("Continue", "Skip this step", "Finish"): a task left
 * without being done is recorded as skipped, then the flow moves on.
 */
export function leaveStepPatch(flow: OnboardingFlow | undefined, step: number): OnboardingPatch {
  const key = stepKeyAt(step);
  const target = nextStep(step);
  return {
    ...(key ? stepResultPatch(flow, key, "skipped") : {}),
    ...goToStepPatch(flow, target),
  };
}

/** Leaving setup early. A flow already completed stays completed: only its position is saved. */
export function skipSetupPatch(flow: OnboardingFlow | undefined, step: number, now: string): OnboardingPatch {
  const position = { current_step: clampStep(step), max_step_reached: maxReached(flow, step) };
  if (isOnboardingFlow(flow) && flow.status === "completed") return position;
  return { status: "skipped", skipped_at: now, ...position };
}

export function completePatch(now: string): OnboardingPatch {
  return { status: "completed", completed_at: now, current_step: DONE_STEP, max_step_reached: DONE_STEP };
}

export const dismissReminderPatch = (): OnboardingPatch => ({ reminder_dismissed: true });

// ── Copy helpers ───────────────────────────────────────────

export function firstName(name: string | null | undefined): string {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

/** "1 connection", "48 connections". Regular plurals only, which is all the copy needs. */
export function countLabel(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

/**
 * "Ravi", "Ravi and Arjun", "Ravi, Arjun and 2 more". Blanks are dropped. Duplicates are the
 * caller's to remove, by id: two different people can share a name.
 */
export function joinNames(names: readonly string[], shown = 2): string {
  const named = names.map((name) => name.trim()).filter(Boolean);
  if (named.length <= 1) return named[0] ?? "";
  if (named.length <= shown) return `${named.slice(0, -1).join(", ")} and ${named[named.length - 1]}`;
  return `${named.slice(0, shown).join(", ")} and ${named.length - shown} more`;
}

/** The invite link without its protocol, for display. */
export function displayLink(link: string): string {
  return link.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export type ShareTarget = "whatsapp" | "linkedin" | "email";

/** Share URLs for an invite link: WhatsApp, LinkedIn's share-offsite and a mailto. */
export function inviteShareUrls(link: string): Record<ShareTarget, string> {
  const message = `Join me on 6 hops, so we can see how we're connected: ${link}`;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    email: `mailto:?subject=${encodeURIComponent("Join me on 6 hops")}&body=${encodeURIComponent(message)}`,
  };
}
