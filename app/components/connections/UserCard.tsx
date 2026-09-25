import Image from "next/image";
import { StatTile } from "../ui";

interface UserCardProps {
  name: string;
  title?: string;
  avatarUrl?: string | null;
  connectionCount?: number;
  reachableCount?: number;
}

export function UserCard({
  name,
  title,
  avatarUrl,
  connectionCount,
  reachableCount,
}: UserCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 p-6 flex flex-col items-center gap-4">
      <div className="w-24 h-24 relative rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center font-mono text-3xl text-neutral-600">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          name?.charAt(0).toUpperCase() ?? "?"
        )}
      </div>
      <div className="text-center">
        <h2 className="font-mono font-semibold text-neutral-800 text-lg">
          {name}
        </h2>
        {title && (
          <p className="font-mono text-neutral-500 text-sm mt-1">{title}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 mt-2 w-full">
        {connectionCount !== undefined && (
          <StatTile label="connections" count={connectionCount} dot="bg-green-500" />
        )}
        {reachableCount !== undefined && (
          <StatTile label="reachable" count={reachableCount} dot="bg-blue-500" />
        )}
      </div>
    </div>
  );
}
