interface ConnectionItemProps {
  name: string;
  title: string;
  isStarred?: boolean;
  isOnline?: boolean;
}

export function ConnectionItem({
  name,
  title,
  isStarred = false,
  isOnline = false,
}: ConnectionItemProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-mono text-sm text-neutral-600">
            {name.charAt(0).toUpperCase()}
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <p className="font-mono text-sm text-neutral-800">{name}</p>
          <p className="font-mono text-xs text-neutral-400">{title}</p>
        </div>
      </div>
      {isStarred && <span className="text-yellow-500 text-lg">★</span>}
    </div>
  );
}
