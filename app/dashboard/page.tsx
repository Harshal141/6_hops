import {
  GridBackground,
  Navbar,
  Footer,
  CollapsibleBox,
  ConnectionsPanel,
  WelcomeHeader,
  DiscoverPanel,
} from "../components";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-6">
        <WelcomeHeader
          userName={session.user.name ?? ""}
          avatarUrl={session.user.image ?? "/user-avatar.png"}
        />

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <CollapsibleBox
            title="connections"
            icon={<span>◉</span>}
            defaultOpen={false}
          >
            <ConnectionsPanel />
          </CollapsibleBox>

          <CollapsibleBox title="discover" icon={<span>◎</span>}>
            <DiscoverPanel />
          </CollapsibleBox>

          <CollapsibleBox title="graph" icon={<span>◈</span>}>
            <div className="w-full max-w-96 h-64 flex items-center justify-center">
              <span className="font-mono text-neutral-400">
                network graph coming soon...
              </span>
            </div>
          </CollapsibleBox>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
