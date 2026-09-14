import React from "react";

// A dense section panel with a titled header. Sharp corners, 1px borders.
export default function Panel({ title, right, children, className = "", testId }) {
  return (
    <section data-testid={testId} className={`border border-[#27272A] bg-[#0F1115] ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between px-4 h-9 border-b border-[#27272A] bg-[#16191E]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-1.5 w-1.5 bg-[#00E5FF]" />
            <h3 className="font-display text-[11px] uppercase tracking-[0.2em] text-[#F8FAFC] truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] font-data">{right}</div>
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}
