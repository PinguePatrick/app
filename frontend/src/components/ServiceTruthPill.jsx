// §24 extended truth pill: LIVE | VERIFIED | CACHED | SIMULATED | PROPOSED | STALE | UNKNOWN | DOWN | ERROR
import React from "react";

const MAP = {
  LIVE:      { fg: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "#10B981", label: "LIVE" },
  VERIFIED:  { fg: "#10B981", bg: "rgba(16,185,129,0.10)",  border: "#10B981", label: "VERIFIED", dashed: false },
  CACHED:    { fg: "#60A5FA", bg: "rgba(96,165,250,0.12)",  border: "#3B82F6", label: "CACHED", dashed: true },
  SIMULATED: { fg: "#2DD4BF", bg: "rgba(20,184,166,0.12)",  border: "#14B8A6", label: "SIM",   dashed: true, pulse: true },
  PROPOSED:  { fg: "#00E5FF", bg: "rgba(0,229,255,0.10)",   border: "#00E5FF", label: "PROPOSED" },
  STALE:     { fg: "#F59E0B", bg: "rgba(217,119,6,0.12)",   border: "#D97706", label: "STALE", dotted: true },
  UNKNOWN:   { fg: "#A1A1AA", bg: "rgba(113,113,122,0.15)", border: "#71717A", label: "UNKNOWN", dashed: true },
  DOWN:      { fg: "#FB7185", bg: "rgba(220,38,38,0.14)",   border: "#DC2626", label: "DOWN",  strong: true },
  ERROR:     { fg: "#FB7185", bg: "rgba(225,29,72,0.14)",   border: "#E11D48", label: "ERROR", strong: true },
};

export default function ServiceTruthPill({ state, className = "" }) {
  const s = MAP[state] || MAP.UNKNOWN;
  const border = s.dashed ? "border-dashed" : s.dotted ? "border-dotted" : "";
  const strong = s.strong ? "border-2" : "border";
  return (
    <span
      data-testid={`svc-truth-${state}`}
      className={`px-2 py-0.5 ${strong} ${border} inline-flex items-center gap-1.5 font-data uppercase tracking-wider text-[11px] ${s.pulse ? "pulse-sim" : ""} ${className}`}
      style={{ color: s.fg, background: s.bg, borderColor: s.border }}
    >
      <span className="inline-block h-1.5 w-1.5" style={{ background: s.border }} />
      {s.label}
    </span>
  );
}
