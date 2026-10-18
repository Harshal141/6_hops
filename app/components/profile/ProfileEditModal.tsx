"use client";

import { FormProvider } from "react-hook-form";
import { Modal } from "../ui";
import type { Profile, SectionKey } from "@/lib/hooks/profile";
import type { ProfileEditor } from "@/lib/hooks/profileEditor";
import { ProfileEditToolbar } from "./ProfileEditToolbar";
import { ProfileHeaderFields } from "./ProfileHeaderFields";
import { ProfileSections } from "./ProfileSections";

const SECTIONS: readonly SectionKey[] = ["about", "experience", "education", "skills"];

interface Props {
  profile: Profile;
  /** Open while the editor is editing: `editor.start()` opens it, save or cancel closes it. */
  editor: ProfileEditor;
  title: string;
  /** Shown read-only. Used when the profile has none (one not saved yet), e.g. the session email. */
  email?: string;
  /** Focus on close when the button that opened it is gone (see Modal). */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * The profile page's editor in a modal, for editing without leaving the current page.
 * Escape, × and Cancel discard the changes, as Cancel does on the profile page; a click
 * outside doesn't, so a stray tap can't lose a long form.
 */
export function ProfileEditModal({ profile, editor, title, email, returnFocusRef }: Props) {
  return (
    <Modal
      isOpen={editor.isEditing}
      onClose={editor.stop}
      title={title}
      size="lg"
      closeOnBackdrop={false}
      returnFocusRef={returnFocusRef}
      footer={
        <ProfileEditToolbar
          framed={false}
          error={editor.error}
          saving={editor.isSaving}
          onCancel={editor.stop}
          onSave={editor.submit}
        />
      }
    >
      <FormProvider {...editor.form}>
        {/* no avatar: it isn't editable, and on a phone it would squeeze the fields */}
        <div className="pt-4">
          <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border">
            <ProfileHeaderFields email={profile.email || email || ""} />
          </div>
          <ProfileSections profile={profile} sections={SECTIONS} isEditing skillsHint="Skills save as you add them." />
        </div>
      </FormProvider>
    </Modal>
  );
}
