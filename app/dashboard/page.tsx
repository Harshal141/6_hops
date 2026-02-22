import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  GridBackground,
  Navbar,
  Footer,
  CollapsibleBox,
  ConnectionsPanel,
  WelcomeHeader,
  DiscoverPanel,
} from "../components";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-6">
        {/* Welcome Header with User Avatar */}
        <WelcomeHeader
          userName={profile?.name ?? user.email ?? "User"}
          avatarUrl="/user-avatar.png"
        />

        {/* Collapsible Boxes */}
        <div className="flex gap-6">
          {/* Connections Box */}
          <CollapsibleBox
            title="connections"
            icon={<span>◉</span>}
            defaultOpen={false}
          >
            <ConnectionsPanel />
          </CollapsibleBox>

          {/* Discover Connections Box */}
          <CollapsibleBox title="discover" icon={<span>◎</span>}>
            <DiscoverPanel />
          </CollapsibleBox>

          <CollapsibleBox title="graph" icon={<span>◈</span>}>
            <div className="w-96 h-64 flex items-center justify-center">
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
