"use client";

import { BrandLogo, Button, Spinner, type Brand } from "../ui";
import { useProfile } from "@/lib/hooks/profile";
import { useCopyInviteLink } from "@/lib/hooks/useCopyInviteLink";
import { displayLink, inviteShareUrls } from "@/lib/utils/onboarding";
import { InviteHowItWorks } from "./InviteHowItWorks";
import { SectionLabel } from "./SectionLabel";
import { StepHeading } from "./StepHeading";

const SHARE_TARGETS: { brand: Brand; label: string }[] = [
  { brand: "whatsapp", label: "WhatsApp" },
  { brand: "linkedin", label: "LinkedIn" },
  { brand: "email", label: "Email" },
];

interface InviteStepProps {
  /** The link was copied or shared: marks the task done. */
  onShared: () => void;
}

/** Step 3: the referral link, a copy button and three share targets. */
export function InviteStep({ onShared }: InviteStepProps) {
  const { data: profile } = useProfile();
  const { copied, copy, link } = useCopyInviteLink(profile?.user_id || undefined);
  const shareUrls = link ? inviteShareUrls(link) : null;

  const copyLink = async () => {
    if (await copy()) onShared();
  };

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:items-center">
      <div className="flex flex-col gap-[22px] sm:gap-6">
        <StepHeading
          title="Bring your people along"
          lead="Friends who join through your link land on your profile."
        />

        <div className="flex flex-col gap-2">
          <SectionLabel>Your invite link</SectionLabel>
          <div className="flex flex-col border border-fg bg-surface sm:flex-row">
            {/* One line, cut with an ellipsis rather than broken mid-word; the full link is in
                the title and in the text itself for screen readers (the cut is visual only). */}
            <span className="flex flex-1 items-center min-w-0 px-3 py-3.5 sm:px-3.5 text-[13px] sm:text-sm">
              {link ? (
                <span className="block truncate" title={link}>
                  {displayLink(link)}
                </span>
              ) : (
                <Spinner />
              )}
            </span>
            {/* Fixed width, so "Copy link" and "✓ Copied" swap without the link re-flowing. */}
            <div className="shrink-0 sm:w-[156px]">
              <Button variant={copied ? "accent" : "primary"} size="lg" fullWidth onClick={copyLink} disabled={!link}>
                {copied ? "✓ Copied" : "Copy link"}
              </Button>
            </div>
          </div>
          <span role="status" className="sr-only">
            {copied ? "Invite link copied" : ""}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Or share on</SectionLabel>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {SHARE_TARGETS.map(({ brand, label }) => (
              <Button
                key={brand}
                variant="secondary"
                size="tile"
                href={shareUrls?.[brand]}
                external={brand !== "email"}
                disabled={!shareUrls}
                onClick={onShared}
                icon={<BrandLogo brand={brand} />}
                ariaLabel={`Share on ${label}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <InviteHowItWorks name={profile?.name ?? ""} icon={profile?.icon || null} />
      </div>
    </div>
  );
}
