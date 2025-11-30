import {
  GridBackground,
  Navbar,
  Footer,
  CollapsibleBox,
  ConnectionsPanel,
  WelcomeHeader,
} from "../components";

export default function Dashboard() {
  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-6">
        {/* Welcome Header with User Avatar */}
        <WelcomeHeader
          userName="Harshal Patil"
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

          {/* Placeholder boxes for future functionality */}
          <CollapsibleBox title="discover" icon={<span>◎</span>}>
            <div className="w-96 h-64 flex items-center justify-center">
              <span className="font-mono text-neutral-400">
                discovery feature coming soon...
              </span>
            </div>
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
