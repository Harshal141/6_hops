import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export function Button({ children, onClick, href }: ButtonProps) {
  const className =
    "group relative px-8 py-4 bg-neutral-800 text-white font-mono text-sm tracking-wide hover:bg-neutral-700 transition-all duration-200 inline-block";

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 border border-neutral-800 translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
