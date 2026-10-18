import { Avatar, Badge, Card } from "../ui";

interface ReferrerCardProps {
  name: string;
  icon: string | null;
  /** "Engineering manager · 48 connections" */
  detail: string;
  action: React.ReactNode;
}

/** The person whose invite brought this user in, emphasised above the other suggestions. */
export function ReferrerCard({ name, icon, detail, action }: ReferrerCardProps) {
  return (
    <Card tone="accent" padding="none">
      <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-[18px] sm:py-4">
        <div className="flex flex-1 items-center gap-3 min-w-0 sm:gap-4">
          <Avatar src={icon} name={name} size="lg" tone="self" />
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2.5">
              <span className="text-sm sm:text-[15px] font-semibold truncate max-w-full">{name}</span>
              <Badge tone="accent" compact>
                Invited you
              </Badge>
            </div>
            {detail && <span className="hidden sm:block text-xs text-fg-muted truncate">{detail}</span>}
          </div>
        </div>
        <div className="sm:shrink-0">{action}</div>
      </div>
    </Card>
  );
}
