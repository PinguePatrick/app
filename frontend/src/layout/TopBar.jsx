import React from "react";
import { useCell } from "@/state/CellContext";
import { Search, Command, Activity, ShieldCheck } from "lucide-react";

export default function TopBar() {
  const { cell, operator, setPaletteOpen } = useCell();
  return (
    <header
      data-testid="top-status-bar"
      className="h-12 shrink-0 border-b border-[#27272A] bg-[#0B0D10] flex items-center px-4 gap-4 relative"
    >
      {/* CELL identity */}
      <div className="flex items-center gap-2 min-w-[210px]">
        <div className="h-6 w-6 border border-[#00E5FF] flex items-center justify-center">
          <div className="h-2 w-2 bg-[#00E5FF] blink" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-sm tracking-[0.3em] text-[#F8FAFC]">CELL</span>
          <span className="font-data text-[10px] text-[#52525B]">{cell?.version ?? "…"}</span>
        </div>
      </div>

      <div className="h-6 w-px bg-[#27272A]" />

      {/* CELL state */}
      <div className="flex items-center gap-4 text-[11px] font-data uppercase tracking-widest">
        <div className="flex items-center gap-2" data-testid="cell-status-nominal">
          <Activity size={12} className="text-[#10B981]" />
          <span className="text-[#94A3B8]">STATUS</span>
          <span className="text-[#F8FAFC]">{cell?.status ?? "…"}</span>
        </div>
        <div className="flex items-center gap-2" data-testid="cell-posture">
          <span className="text-[#94A3B8]">POSTURE</span>
          <span className="text-[#00E5FF]">{cell?.posture ?? "…"}</span>
        </div>
        <div className="hidden md:flex items-center gap-2" data-testid="cell-map-sync">
          <span className="text-[#94A3B8]">MAP</span>
          <span className="text-[#F8FAFC]">SYNC 09:38:12</span>
        </div>
      </div>

      {/* Global search */}
      <button
        data-testid="global-search-trigger"
        onClick={() => setPaletteOpen(true)}
        className="ml-auto flex items-center gap-2 h-8 px-3 border border-[#27272A] bg-[#0F1115] hover:border-[#00E5FF] transition-colors min-w-[320px] text-left"
      >
        <Search size={13} className="text-[#52525B]" />
        <span className="font-data text-[11px] text-[#52525B] flex-1">Search systems, agents, missions…</span>
        <span className="font-data text-[10px] text-[#52525B] border border-[#27272A] px-1.5 py-0.5 flex items-center gap-1">
          <Command size={9} /> K
        </span>
      </button>

      {/* Operator */}
      <div className="flex items-center gap-3 pl-4 border-l border-[#27272A]" data-testid="operator-identity">
        <ShieldCheck size={13} className="text-[#00E5FF]" />
        <div className="flex flex-col leading-tight">
          <span className="font-data text-[11px] text-[#F8FAFC]">{operator?.handle ?? "…"}</span>
          <span className="font-data text-[9px] text-[#52525B] uppercase tracking-wider">{operator?.clearance ?? ""}</span>
        </div>
      </div>
    </header>
  );
}
