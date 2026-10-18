"use client";

import { useEffect, useRef, useState } from "react";
import { AiBadge, Button, useToast } from "../ui";
import { ImportPick, ResumeImportModal } from "../resume-import";
import { ProfileEditModal } from "../profile";
import { useProfile } from "@/lib/hooks/profile";
import { useProfileEditor } from "@/lib/hooks/profileEditor";
import type { OnboardingStepResult } from "@/lib/hooks/flags";
import { hasProfileContent, hasProfileDetails } from "@/lib/utils/profileSummary";
import { ProfilePreview } from "./ProfilePreview";
import { ProfileSummary } from "./ProfileSummary";
import { StepHeading } from "./StepHeading";

interface ProfileStepProps {
  result: OnboardingStepResult | undefined;
  /** The signed-in name, shown in the preview until the profile loads (and if it has none). */
  sessionName: string;
  /** The signed-in email, shown in the editor while the profile has none (not saved yet). */
  sessionEmail: string;
  /**
   * The task counts as done: the profile already had experience or education, or the edit
   * modal was saved with anything in it. Called at most once per visit.
   */
  onDone: () => void;
  /** A resume import was saved: done, and on to the next step. */
  onImported: () => void;
}

const HEADINGS = {
  empty: { title: "Build your profile in one drop", lead: "Upload your resume. You review everything before it saves." },
  filled: { title: "Your profile is ready", lead: "Check what we filled in. Edit anything that looks off." },
} as const;

/**
 * Step 1: the resume import, inline. Dropping a file opens the shared import modal
 * straight on "Reading your resume", so review and save are exactly the profile page's.
 * "Fill it in myself" and "Edit details" open the profile page's editor in a modal, so
 * nothing here leaves setup.
 */
export function ProfileStep({ result, sessionName, sessionEmail, onDone, onImported }: ProfileStepProps) {
  const { data: profile } = useProfile();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  // experience or education: what the import and "already done" go by
  const hasDetails = hasProfileDetails(profile);
  // anything at all (a headline, a skill): enough to show what's there instead of the sketch
  const filled = hasProfileContent(profile) || result === "done";

  // Once per visit, not "whenever result isn't done": a failed write rolls `result` back, and
  // re-firing on that would retry the write forever. A later visit tries again.
  const reportedDone = useRef(false);
  const reportDone = () => {
    if (result === "done" || reportedDone.current) return;
    reportedDone.current = true;
    onDone();
  };

  const editor = useProfileEditor(profile, {
    onSaved: ({ changed, profile: saved }) => {
      if (changed) toast("Profile updated");
      if (hasProfileContent(saved)) reportDone();
    },
    onError: (message) => toast(message, "error"),
  });
  // Set on open, so adding a skill (which saves at once) doesn't retitle the open modal.
  const [editTitle, setEditTitle] = useState("");
  const openEditor = () => {
    setEditTitle(filled ? "Edit your details" : "Fill in your profile");
    editor.start();
  };

  useEffect(() => {
    if (!hasDetails || result === "done" || reportedDone.current) return;
    reportedDone.current = true;
    onDone();
  }, [hasDetails, result, onDone]);

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5 min-w-0">
        <StepHeading eyebrow={<AiBadge>Autofill with AI</AiBadge>} {...HEADINGS[filled ? "filled" : "empty"]} />

        {filled ? (
          <div className="flex flex-col items-start gap-3 border border-border bg-surface p-4">
            <p role="status" className="text-[13px] text-fg-body">
              <span aria-hidden>✓ </span>Your profile has your details. You can change them any time.
            </p>
            <Button variant="secondary" size="md" onClick={openEditor} disabled={!profile} buttonRef={editButton}>
              Edit details
            </Button>
            {/* phones hide the side panel, so what was filled in shows here, under the button
                so the button stays in reach */}
            {profile && (
              <section aria-label="What we filled in" className="w-full border-t border-border pt-3 sm:hidden">
                <ProfileSummary profile={profile} compact />
              </section>
            )}
          </div>
        ) : (
          // disabled until the profile loads: the editor opens from it
          <ImportPick onFile={setFile} onManual={openEditor} manualDisabled={!profile} />
        )}
      </div>

      <div className="hidden sm:block">
        <ProfilePreview
          name={profile?.name || sessionName}
          icon={profile?.icon || null}
          filled={filled ? profile : undefined}
        />
      </div>

      {file && (
        <ResumeImportModal
          initialFile={file}
          onApplied={onImported}
          onClose={() => setFile(null)}
        />
      )}
      {profile && (
        <ProfileEditModal
          profile={profile}
          editor={editor}
          title={editTitle}
          email={sessionEmail}
          returnFocusRef={editButton}
        />
      )}
    </div>
  );
}
