import React from "react";

const MAP = {
  PENDING:  { color: "#D97706", label: "PENDING" },
  APPROVED: { color: "#00E5FF", label: "APPROVED" },
  BLOCKED:  { color: "#DC2626", label: "BLOCKED" },
  EXECUTED: { color: "#10B981", label: "EXECUTED" },
};

export default function GovernanceBadge({ state, className = "" }) {
  const s = MAP[state] || { color: "#71717A", label: state };
  return (
    <span
      data-testid={`gov-badge-${state}`}
      className={`px-2 py-0.5 border font-data uppercase text-[11px] tracking-wider inline-flex items-center gap-1.5 ${className}`}
      style={{ color: s.color, borderColor: s.color, background: `${s.color}18` }}
    >
      <span className="inline-block h-1.5 w-1.5" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
