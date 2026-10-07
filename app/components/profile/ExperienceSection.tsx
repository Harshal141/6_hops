import type { Experience } from "@/lib/hooks/profile";
import { ProfileSection } from "./ProfileSection";
import { PROFILE_TEXT } from "./profileText";

export function ExperienceSection({ experience }: { experience: Experience[] }) {
  return (
    <ProfileSection title="Experience">
      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div key={exp.id ?? index} className="border-l-2 border-border pl-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className={PROFILE_TEXT.itemTitle}>
                {exp.role || <span className="text-fg-placeholder italic">No role</span>}
              </h3>
              <span className={`${PROFILE_TEXT.meta} shrink-0`}>
                {exp.started_at ? new Date(exp.started_at).getFullYear() : ""}
                {exp.started_at ? " – " : ""}
                {exp.currently_working ? "present" : exp.ended_at ? new Date(exp.ended_at).getFullYear() : ""}
              </span>
            </div>
            <p className={PROFILE_TEXT.itemSubtitle}>{exp.company}</p>
            {exp.description && <p className={`${PROFILE_TEXT.body} mt-1`}>{exp.description}</p>}
          </div>
        ))}
        {experience.length === 0 && <p className={PROFILE_TEXT.empty}>No experience added</p>}
      </div>
    </ProfileSection>
  );
}
