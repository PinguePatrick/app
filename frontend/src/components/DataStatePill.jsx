// Reusable data-state pill for KNOWN | UNKNOWN | STALE | CONFLICTING | SIMULATED
import React from "react";

const MAP = {
  KNOWN:       { fg: "#F8FAFC", bg: "rgba(248,250,252,0.08)", border: "#F8FAFC", label: "KNOWN" },
  UNKNOWN:     { fg: "#A1A1AA", bg: "rgba(113,113,122,0.15)", border: "#71717A", label: "UNKNOWN", dashed: true },
  STALE:       { fg: "#F59E0B", bg: "rgba(217,119,6,0.12)",   border: "#D97706", label: "STALE",   dotted: true },
  CONFLICTING: { fg: "#FB7185", bg: "rgba(225,29,72,0.14)",   border: "#E11D48", label: "CONFLICT", strong: true },
  SIMULATED:   { fg: "#2DD4BF", bg: "rgba(20,184,166,0.12)",  border: "#14B8A6", label: "SIM", dashed: true, pulse: true },
};

export default function DataStatePill({ state, size = "sm", withDot = true, className = "" }) {
  const s = MAP[state] || MAP.UNKNOWN;
  const px = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";
  const border = s.dashed ? "border-dashed" : s.dotted ? "border-dotted" : "";
  const strong = s.strong ? "border-2" : "border";
  return (
    <span
      data-testid={`data-state-${state}`}
      className={`${px} ${border} ${strong} inline-flex items-center gap-1.5 font-data uppercase tracking-wider ${s.pulse ? "pulse-sim" : ""} ${className}`}
      style={{ color: s.fg, background: s.bg, borderColor: s.border }}
    >
      {withDot && <span className="inline-block h-1.5 w-1.5" style={{ background: s.border }} />}
      {s.label}
    </span>
  );
}
