import type { OnboardingStepKey } from "@/lib/hooks/flags";

/** The task names the stepper, the checklist and the reminder share. */
export const STEP_LABELS: Record<OnboardingStepKey, string> = {
  profile: "Profile",
  connect: "Connect",
  invite: "Invite",
};
