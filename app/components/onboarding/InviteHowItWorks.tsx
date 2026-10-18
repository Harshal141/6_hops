import { Avatar, Card, LineIcon } from "../ui";

interface InviteHowItWorksProps {
  name: string;
  icon: string | null;
}

/** A dashed connector between two nodes of the sketch. */
function Dash() {
  return <span aria-hidden className="flex-1 mx-2.5 mb-[18px] border-t-[1.5px] border-dashed border-accent" />;
}

function Node({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {children}
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

/** You, then your link, then a friend: what happens to an invite, beside the link itself. */
export function InviteHowItWorks({ name, icon }: InviteHowItWorksProps) {
  return (
    <Card padding="none">
      <div className="flex flex-col gap-[18px] p-[22px]">
        <h2 className="text-[11px] font-normal text-fg-muted">How it works</h2>
        <div aria-hidden className="flex items-center justify-between">
          <Node label="You">
            <Avatar src={icon} name={name || "You"} size="md" tone="self" />
          </Node>
          <Dash />
          <Node label="Link">
            <span className="w-11 h-11 flex items-center justify-center border border-fg-placeholder bg-surface text-fg-body">
              <LineIcon name="link" size={18} strokeWidth={1.8} />
            </span>
          </Node>
          <Dash />
          <Node label="Friend">
            <span className="w-11 h-11 rounded-full flex items-center justify-center border-[1.5px] border-dashed border-fg-subtle text-fg-muted">
              +
            </span>
          </Node>
        </div>
        <ol className="list-decimal pl-[18px] flex flex-col gap-1.5 text-xs leading-normal text-fg-body">
          <li>They open your link and sign in</li>
          <li>They land on your profile</li>
          <li>One tap and you&apos;re connected</li>
        </ol>
      </div>
    </Card>
  );
}
