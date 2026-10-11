import { Button } from "../ui";
import { CLOSING, HERO } from "./landingContent";

export function ClosingCta() {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="font-mono text-2xl sm:text-4xl font-bold text-fg tracking-tight mb-4">{CLOSING.title}</h2>
      <p className="font-mono text-sm sm:text-base text-fg-muted mb-8 sm:mb-10">{CLOSING.body}</p>
      <Button href={HERO.ctaHref}>{HERO.cta}</Button>
    </div>
  );
}
