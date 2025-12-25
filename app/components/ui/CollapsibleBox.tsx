"use client";

import { useState } from "react";

interface CollapsibleBoxProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleBox({
  title,
  icon,
  children,
  defaultOpen = false,
}: CollapsibleBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <>
      {/* Blur Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Collapsed State - Small Square Box */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="w-24 h-24 bg-white/90 backdrop-blur-sm border border-neutral-200
                     flex flex-col items-center justify-center gap-2 cursor-pointer
                     hover:bg-white hover:border-neutral-300 hover:shadow-lg
                     transition-all duration-200"
        >
          {icon && <div className="text-2xl text-neutral-600">{icon}</div>}
          <span className="text-xs font-mono text-neutral-500 text-center px-2">
            {title}
          </span>
        </div>
      )}

      {/* Expanded State - Full Box with Content */}
      {isOpen && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                     bg-white/95 backdrop-blur-md border border-neutral-200 shadow-2xl
                     max-w-5xl w-[90vw] max-h-[80vh] overflow-hidden"
          style={{
            backgroundImage: `
              linear-gradient(#e5e5e5 1px, transparent 1px),
              linear-gradient(90deg, #e5e5e5 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/80 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              {icon && <span className="text-neutral-600">{icon}</span>}
              <span className="font-mono font-semibold text-neutral-800">
                {title}
              </span>
            </div>
            {/* Mac-style traffic light close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600
                         transition-colors flex items-center justify-center group"
            >
              <span className="opacity-0 group-hover:opacity-100 text-red-900 text-[8px] font-bold">
                ×
              </span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-auto max-h-[calc(80vh-60px)]">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
