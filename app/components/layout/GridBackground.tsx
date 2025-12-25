interface GridBackgroundProps {
  children: React.ReactNode;
}

export function GridBackground({ children }: GridBackgroundProps) {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundColor: "#f5f5f5",
        backgroundImage: `
          linear-gradient(#d0d0d0 1px, transparent 1px),
          linear-gradient(90deg, #d0d0d0 1px, transparent 1px),
          linear-gradient(#e0e0e0 0.5px, transparent 0.5px),
          linear-gradient(90deg, #e0e0e0 0.5px, transparent 0.5px)
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
