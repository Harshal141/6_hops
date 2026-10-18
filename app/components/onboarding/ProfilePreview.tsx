import { AiSparkle, Card } from "../ui";
import type { Profile } from "@/lib/hooks/profile";
import { ProfileIdentity } from "./ProfileIdentity";
import { ProfileSummary } from "./ProfileSummary";

interface ProfilePreviewProps {
  name: string;
  icon: string | null;
  /** The profile has details: show what it holds instead of the sketch. */
  filled?: Profile;
}

/** A placeholder line standing in for a field the import will fill. */
function Placeholder({ width }: { width: string }) {
  return <span aria-hidden className="block h-2 bg-border/60" style={{ width }} />;
}

const SECTIONS: { label: string; lines: string[] }[] = [
  { label: "Experience", lines: ["90%", "70%"] },
  { label: "Education", lines: ["80%"] },
];

/** The sketch before anything is filled in: your real name, the rest to come. */
function Sketch({ name, icon }: Pick<ProfilePreviewProps, "name" | "icon">) {
  return (
    <div className="flex flex-col gap-[18px]">
      <ProfileIdentity
        name={name}
        icon={icon}
        subline={<span className="text-[11px] text-fg-muted">From your sign in</span>}
      />
      {SECTIONS.map(({ label, lines }) => (
        <div key={label} className="flex flex-col gap-2">
          <span className="text-[11px] text-fg-body">{label}</span>
          {lines.map((width) => (
            <Placeholder key={width} width={width} />
          ))}
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-fg-body">Skills</span>
        <div aria-hidden className="flex gap-1.5">
          {[54, 72, 44].map((width) => (
            <span key={width} className="block h-[18px] border border-border" style={{ width }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Beside the resume dropzone: "what we fill in" as a sketch, then "what we filled in" for real. */
export function ProfilePreview({ name, icon, filled }: ProfilePreviewProps) {
  const title = filled ? "What we filled in" : "What we fill in";
  return (
    <Card
      padding="none"
      fullHeight
      header={
        <span className="flex items-center justify-between text-[11px] text-fg-muted">
          {title}
          <AiSparkle />
        </span>
      }
    >
      <section aria-label={title} className="p-[18px]">
        {filled ? <ProfileSummary profile={filled} /> : <Sketch name={name} icon={icon} />}
      </section>
    </Card>
  );
}
