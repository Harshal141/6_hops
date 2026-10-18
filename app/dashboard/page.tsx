import {
  GridBackground,
  Navbar,
  Footer,
  CollapsibleBox,
  ConnectionsBox,
  ConnectionsGraph,
  WelcomeHeader,
  DiscoverPanel,
  SetupReminder,
} from "../components";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { needsOnboarding } from "@/lib/onboardingGate";
import { LEFT_ONBOARDING_PARAM } from "@/lib/utils/onboarding";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  // A new signup sets up first. The param is the way out when leaving setup couldn't be
  // saved, so a failed write can never bounce the user back into it.
  const leftOnboarding = (await searchParams)[LEFT_ONBOARDING_PARAM] !== undefined;
  if (!leftOnboarding && (await needsOnboarding(session.user.id))) redirect("/onboarding");

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-6">
        <WelcomeHeader
          userName={session.user.name ?? ""}
          avatarUrl={session.user.image ?? "/user-avatar.png"}
        />

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <ConnectionsBox />

          <CollapsibleBox title="Discover" icon={<span>◎</span>} onboardingId="discover">
            <DiscoverPanel />
          </CollapsibleBox>

          <CollapsibleBox title="Graph" icon={<span>◈</span>} onboardingId="graph">
            <ConnectionsGraph />
          </CollapsibleBox>
        </div>

        <SetupReminder />
      </main>
      <Footer />
    </GridBackground>
  );
}
