import { GridBackground, Footer } from "../layout";
import { Reveal } from "../ui";
import { LandingHero } from "./LandingHero";
import { LandingSection } from "./LandingSection";
import { SectionHeading } from "./SectionHeading";
import { FeatureShowcase } from "./FeatureShowcase";
import { StepJourney } from "./StepJourney";
import { HopFlight } from "./HopFlight";
import { ClosingCta } from "./ClosingCta";
import { STEPS } from "./landingContent";

/** The public home page. */
export function LandingPage() {
  return (
    <GridBackground>
      <LandingHero />

      <LandingSection>
        <Reveal>
          <SectionHeading label="Features" title="Built on who you know" />
        </Reveal>
        <FeatureShowcase />
      </LandingSection>

      <LandingSection id="how-it-works">
        <Reveal>
          <SectionHeading label="How it works" title="Three steps to your first path" />
        </Reveal>
        <StepJourney items={STEPS} />
      </LandingSection>

      <HopFlight labelled={false} />

      <LandingSection>
        <Reveal>
          <ClosingCta />
        </Reveal>
      </LandingSection>

      <Footer />
    </GridBackground>
  );
}
