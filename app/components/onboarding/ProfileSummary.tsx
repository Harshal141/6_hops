import { Chip } from "../ui";
import type { Profile } from "@/lib/hooks/profile";
import { ProfileIdentity } from "./ProfileIdentity";
import { DEFAULT_SUMMARY_LIMITS, summarizeProfile, type SummaryLine } from "@/lib/utils/profileSummary";

interface ProfileSummaryProps {
  profile: Profile;
  /** Phones: no avatar, and fewer skill chips. */
  compact?: boolean;
}

const COMPACT_LIMITS = { ...DEFAULT_SUMMARY_LIMITS, skills: 4 };

const NothingYet = ({ label = "Nothing yet" }: { label?: string }) => (
  <span className="text-[11px] text-fg-placeholder">{label}</span>
);

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] text-fg-muted">{label}</span>
      {children}
    </div>
  );
}

function Lines({ lines }: { lines: SummaryLine[] }) {
  if (lines.length === 0) return <NothingYet />;
  return (
    <ul className="flex flex-col gap-1">
      {lines.map((line) => (
        <li key={line.key} className="text-[13px] text-fg-body truncate">
          {line.label}
        </li>
      ))}
    </ul>
  );
}

/** What the profile holds now, briefly: headline, latest roles, schools and skills. */
export function ProfileSummary({ profile, compact = false }: ProfileSummaryProps) {
  const summary = summarizeProfile(profile, compact ? COMPACT_LIMITS : DEFAULT_SUMMARY_LIMITS);

  return (
    <div className={`flex flex-col ${compact ? "gap-3" : "gap-[18px]"}`}>
      <ProfileIdentity
        name={profile.name}
        icon={profile.icon || null}
        showAvatar={!compact}
        subline={
          summary.headline ? (
            <span className="text-[11px] text-fg-muted truncate">{summary.headline}</span>
          ) : (
            <NothingYet label="No headline yet" />
          )
        }
      />
      <SummarySection label="Experience">
        <Lines lines={summary.roles} />
      </SummarySection>
      <SummarySection label="Education">
        <Lines lines={summary.schools} />
      </SummarySection>
      <SummarySection label="Skills">
        {summary.skills.length === 0 ? (
          <NothingYet />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {summary.skills.map((name) => (
              <Chip key={name} label={name} />
            ))}
            {summary.moreSkills > 0 && <Chip label={`+${summary.moreSkills} more`} variant="muted" />}
          </div>
        )}
      </SummarySection>
    </div>
  );
}
