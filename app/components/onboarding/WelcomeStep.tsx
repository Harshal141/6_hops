import { Card, LineIcon, type LineIconName } from "../ui";
import { StepHeading } from "./StepHeading";

const TASKS: { icon: LineIconName; title: string; time: string }[] = [
  { icon: "document", title: "Your profile", time: "30 sec" },
  { icon: "connect", title: "First connection", time: "1 min" },
  { icon: "link", title: "Invite friends", time: "20 sec" },
];

interface WelcomeStepProps {
  firstName: string;
}

/** The opening screen: a greeting and what the three steps are. */
export function WelcomeStep({ firstName }: WelcomeStepProps) {
  return (
    <div className="flex flex-col gap-[22px] sm:gap-8 sm:pt-2">
      <StepHeading
        title={firstName ? `Hi ${firstName}, let's get you set up` : "Let's get you set up"}
        lead="Three quick steps. Skip any you like."
      />

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
        {TASKS.map(({ icon, title, time }) => (
          <li key={title}>
            <Card padding="none" fullHeight>
              <div className="flex items-center gap-3 p-3.5 sm:gap-3.5 sm:p-[18px]">
                <LineIcon name={icon} size={22} strokeWidth={1.6} />
                <div className="flex flex-1 items-center justify-between gap-1 sm:flex-col sm:items-start">
                  <span className="text-[13px] sm:text-sm font-semibold">{title}</span>
                  <span className="text-[11px] text-fg-muted">{time}</span>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
