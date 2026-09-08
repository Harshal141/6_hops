interface GridBackgroundProps {
  children: React.ReactNode;
}

export function GridBackground({ children }: GridBackgroundProps) {
  return (
    <div
      className="min-h-dvh w-full flex flex-col"
      style={{
        backgroundColor: "#f6f6f6",
        backgroundImage: `
          linear-gradient(#d5d5d5 1px, transparent 1px),
          linear-gradient(90deg, #d5d5d5 1px, transparent 1px),
          linear-gradient(#e3e3e3 0.5px, transparent 0.5px),
          linear-gradient(90deg, #e3e3e3 0.5px, transparent 0.5px)
        `,
        backgroundSize: `
          50px 50px,
          50px 50px,
          10px 10px,
          10px 10px
        `,
      }}
    >
      {children}
    </div>
  );
}
