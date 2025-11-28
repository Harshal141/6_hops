import { UserCard } from "./UserCard";
import { ConnectionsList } from "./ConnectionsList";
import { IndirectConnectionsList } from "./IndirectConnectionsList";

export function ConnectionsPanel() {
  return (
    <div className="flex gap-4 h-[60vh]">
      {/* Left Panel - User Card */}
      <div className="w-64 shrink-0">
        <UserCard
          name="Harshal Patil"
          title="Software Engineer"
          avatarUrl="/user-avatar.png"
          connectionCount={8}
          reachableCount={12}
        />
      </div>

      {/* Middle Panel - Direct Connections */}
      <div className="w-80 shrink-0 h-full">
        <ConnectionsList />
      </div>

      {/* Right Panel - Indirect/Reachable Connections */}
      <div className="w-80 shrink-0 h-full">
        <IndirectConnectionsList />
      </div>
    </div>
  );
}
