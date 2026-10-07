import type { Education } from "@/lib/hooks/profile";
import { displayYear } from "@/lib/utils/educationYear";
import { ProfileSection } from "./ProfileSection";
import { PROFILE_TEXT } from "./profileText";

export function EducationSection({ education }: { education: Education[] }) {
  return (
    <ProfileSection title="Education">
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={edu.id ?? index} className="flex items-baseline justify-between gap-3">
            {/* With no degree, the school is the title rather than a "No degree" placeholder. */}
            <div>
              <h3 className={PROFILE_TEXT.itemTitle}>{edu.degree || edu.institution}</h3>
              {edu.degree && <p className={PROFILE_TEXT.itemSubtitle}>{edu.institution}</p>}
            </div>
            <span className={`${PROFILE_TEXT.meta} shrink-0`}>{displayYear(edu.year)}</span>
          </div>
        ))}
        {education.length === 0 && <p className={PROFILE_TEXT.empty}>No education added</p>}
      </div>
    </ProfileSection>
  );
}
