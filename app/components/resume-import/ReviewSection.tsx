import { PROFILE_TEXT } from "../profile/profileText";

interface Props {
  title: string;
  children: React.ReactNode;
}

/** One titled group in the import review (about you, experience, skills…). */
export function ReviewSection({ title, children }: Props) {
  return (
    <section>
      <h4 className={`${PROFILE_TEXT.sectionHeading} mb-3`}>{title}</h4>
      {children}
    </section>
  );
}
