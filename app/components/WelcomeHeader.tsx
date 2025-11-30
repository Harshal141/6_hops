import Image from "next/image";
import Link from "next/link";

interface WelcomeHeaderProps {
  userName: string;
  avatarUrl: string;
}

export function WelcomeHeader({ userName, avatarUrl }: WelcomeHeaderProps) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className="text-center">
        <p className="font-mono text-neutral-400 text-sm">welcome back,</p>
        <h1 className="font-mono font-bold text-2xl text-neutral-800">
          {firstName}
        </h1>
      </div>
      <Link
        href="/profile"
        className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-200 hover:border-neutral-400 transition-colors cursor-pointer"
      >
        <Image
          src={avatarUrl}
          alt={userName}
          fill
          className="object-cover"
        />
      </Link>
    </div>
  );
}
