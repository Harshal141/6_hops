import { Avatar, Card } from "../ui";

interface PersonCardProps {
  name: string;
  icon: string | null;
  /** Headline or title; falls back to `meta` when absent. */
  subtitle: string | null;
  /** Secondary fact, such as "214 connections". */
  meta?: string;
  /** The connect button or the request state. */
  action: React.ReactNode;
}

/**
 * One person to connect with. A row on mobile (avatar, name, action); from `sm` up a
 * small card in a three-column grid, with the meta line beside the action.
 */
export function PersonCard({ name, icon, subtitle, meta, action }: PersonCardProps) {
  const subline = subtitle ?? meta ?? null;
  const showMeta = Boolean(subtitle && meta);

  return (
    <Card padding="sm" fullHeight>
      <div className="flex h-full items-center gap-2.5 sm:flex-col sm:items-stretch sm:justify-between sm:gap-3">
        <div className="flex flex-1 items-center gap-2.5 min-w-0 sm:flex-none">
          <Avatar src={icon} name={name} size="md" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13px] font-semibold truncate">{name}</span>
            {subline && <span className="text-[11px] text-fg-muted truncate">{subline}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-2">
          {showMeta && <span className="hidden sm:inline text-[11px] text-fg-muted">{meta}</span>}
          <span className="sm:ml-auto">{action}</span>
        </div>
      </div>
    </Card>
  );
}
