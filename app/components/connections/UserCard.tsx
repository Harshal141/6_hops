import Image from "next/image";

interface UserCardProps {
  name: string;
  title?: string;
  avatarUrl: string;
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
      <div className="w-24 h-24 relative">
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover rounded-full"
        />
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
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500 px-2 py-2 bg-neutral-50 rounded">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              connections
            </span>
            <span className="font-semibold text-neutral-800">{connectionCount}</span>
          </div>
        )}
        {reachableCount !== undefined && (
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500 px-2 py-2 bg-neutral-50 rounded">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              reachable
            </span>
            <span className="font-semibold text-neutral-800">{reachableCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
