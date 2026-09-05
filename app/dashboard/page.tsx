import {
  GridBackground,
  Navbar,
  Footer,
  CollapsibleBox,
  ConnectionsBox,
  ConnectionsGraph,
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
          <ConnectionsBox />

          <CollapsibleBox title="discover" icon={<span>◎</span>}>
            <DiscoverPanel />
          </CollapsibleBox>

          <CollapsibleBox title="graph" icon={<span>◈</span>}>
            <ConnectionsGraph />
          </CollapsibleBox>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
