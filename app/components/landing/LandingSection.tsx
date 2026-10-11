interface LandingSectionProps {
  children: React.ReactNode;
  id?: string;
}

/** The content column every landing section sits in. */
export function LandingSection({ children, id }: LandingSectionProps) {
  return (
    <section id={id} className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-14 sm:py-20 scroll-mt-6">
      {children}
    </section>
  );
}
