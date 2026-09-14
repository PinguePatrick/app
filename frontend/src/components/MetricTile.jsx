import React from "react";

// Dense KPI tile in ops style. Numbers use JetBrains Mono.
export default function MetricTile({ label, value, unit, hint, accent = false, testId }) {
  return (
    <div
      data-testid={testId}
      className={`border border-[#27272A] bg-[#0F1115] p-4 flex flex-col justify-between min-h-[104px] ${accent ? "border-l-2 border-l-[#00E5FF]" : ""}`}
    >
      <div className="text-[10px] font-data uppercase tracking-[0.15em] text-[#94A3B8]">{label}</div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-data text-3xl leading-none text-[#F8FAFC]">{value}</span>
        {unit && <span className="font-data text-xs text-[#52525B] tracking-wider">{unit}</span>}
      </div>
      {hint && <div className="mt-2 text-[11px] text-[#52525B] font-body">{hint}</div>}
    </div>
  );
}
