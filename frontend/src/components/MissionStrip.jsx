// MISSION / MODE / GOVERNANCE / TRUTH — always visible (§23).
import React from "react";
import { useCell } from "@/state/CellContext";
import { Target } from "lucide-react";

export default function MissionStrip() {
  const { mission } = useCell();
  if (!mission) return null;

  const modeColor  = mission.mode === "CONNECTED" ? "#10B981" : mission.mode === "SIMULATED" ? "#14B8A6" : "#D97706";
  const govColor   = "#00E5FF";

  return (
    <div
      data-testid="mission-strip"
      className="border-b border-[#27272A] bg-[#0B0D10] px-4 h-8 flex items-center gap-6 text-[11px] font-data uppercase tracking-[0.18em] overflow-x-auto"
    >
      <div className="flex items-center gap-2 shrink-0">
        <Target size={11} className="text-[#00E5FF]" />
        <span className="text-[#52525B]">MISSION</span>
        <span data-testid="mission-codename" className="text-[#F8FAFC]">{mission.codename}</span>
        <span className="text-[#3F3F46]">·</span>
        <span className="text-[#94A3B8] normal-case tracking-normal font-body">{mission.objective}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <span className="text-[#52525B]">PHASE</span>
        <span className="text-[#F8FAFC]">{mission.phase}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[#52525B]">MODE</span>
        <span data-testid="mission-mode" className="px-1.5 border" style={{ color: modeColor, borderColor: modeColor, background: `${modeColor}18` }}>{mission.mode}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[#52525B]">GOVERNANCE</span>
        <span data-testid="mission-governance" className="px-1.5 border" style={{ color: govColor, borderColor: govColor, background: `${govColor}18` }}>{mission.governance}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[#52525B]">TRUTH</span>
        <span data-testid="mission-truth" className="text-[#F8FAFC]">{mission.truth_source}</span>
      </div>
    </div>
  );
}
