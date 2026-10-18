import { LineIcon } from "../ui";
import { SITE, type SocialNetwork } from "../../siteMeta";

const NETWORKS: { network: SocialNetwork; label: string }[] = [
  { network: "instagram", label: "6 hops on Instagram" },
  { network: "linkedin", label: "6 hops on LinkedIn" },
];

interface SocialLinksProps {
  /** Icon size in px. The tap target stays at least 40px either way. */
  iconSize?: number;
}

/** The brand's own accounts as outline icon links, opening in a new tab. URLs live in SITE.social. */
export function SocialLinks({ iconSize = 16 }: SocialLinksProps) {
  return (
    <span className="flex items-center">
      {NETWORKS.map(({ network, label }) => (
        <a
          key={network}
          href={SITE.social[network]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-fg-muted hover:text-fg
                     transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        >
          <LineIcon name={network} size={iconSize} strokeWidth={1.8} />
        </a>
      ))}
    </span>
  );
}
