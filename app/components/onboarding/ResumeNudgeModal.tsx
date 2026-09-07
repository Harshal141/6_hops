"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button } from "../ui";
import { useFlags, usePatchFlag } from "@/lib/hooks/flags";
import { useProfile } from "@/lib/hooks/profile";

const nowIso = () => new Date().toISOString();

/**
 * Nudges a user with no experience/education on their profile toward
 * `/profile`, once onboarding is out of the way. Shown once — "maybe later"
 * (or filling it out) marks `resume_prompt` dismissed so it never nags again;
 * whether they actually went on to add anything is derivable later by joining
 * this flag against `profile_experience` / `profile_education`, not tracked
 * here.
 */
export function ResumeNudgeModal() {
  const router = useRouter();
  const { data: flags } = useFlags();
  const { data: profile } = useProfile();
  const patchFlag = usePatchFlag();

  const onboarding = flags?.onboarding;
  const resumePrompt = flags?.resume_prompt;
  const onboardingDone = onboarding?.status === "completed" || onboarding?.status === "skipped";
  const resumeEmpty = Boolean(profile) && profile!.experience.length === 0 && profile!.education.length === 0;
  const isOpen = Boolean(onboardingDone && resumeEmpty && resumePrompt?.status !== "dismissed");

  useEffect(() => {
    if (isOpen && (!resumePrompt || resumePrompt.status === "not_shown")) {
      patchFlag.mutate({ flow: "resume_prompt", patch: { status: "shown", shown_at: nowIso() } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const dismiss = () => {
    patchFlag.mutate({ flow: "resume_prompt", patch: { status: "dismissed", dismissed_at: nowIso() } });
  };

  const fillItOut = () => {
    dismiss();
    router.push("/profile");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={dismiss}
      title="Finish your resume"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={dismiss}>
            maybe later
          </Button>
          <Button variant="primary" size="sm" onClick={fillItOut}>
            fill it out
          </Button>
        </>
      }
    >
      <p className="text-sm text-neutral-600">
        Add your work experience and education so people you connect with can see what you actually
        do. It only takes a couple of minutes.
      </p>
    </Modal>
  );
}
