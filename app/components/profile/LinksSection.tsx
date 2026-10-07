import type { Link } from "@/lib/hooks/profile";
import { ProfileSection } from "./ProfileSection";
import { PROFILE_TEXT } from "./profileText";

export function LinksSection({ links }: { links: Link[] }) {
  return (
    <ProfileSection title="Links">
      <div className="flex flex-wrap gap-3">
        {links.map((link, index) => (
          <a
            key={link.id ?? index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            [{link.type}]
          </a>
        ))}
        {links.length === 0 && <p className={PROFILE_TEXT.empty}>No links added</p>}
      </div>
    </ProfileSection>
  );
}
