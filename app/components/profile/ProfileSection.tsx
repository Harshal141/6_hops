import { PROFILE_TEXT } from "./profileText";

interface Props {
  title: string;
  /** Right of the heading, e.g. an "Add" button in the editor. */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** The frame every profile section shares, in view and edit mode. */
export function ProfileSection({ title, action, children }: Props) {
  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className={PROFILE_TEXT.sectionHeading}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
