import React, { useMemo } from "react";
import { useCell } from "@/state/CellContext";
import DataStatePill from "@/components/DataStatePill";
import GovernanceBadge from "@/components/GovernanceBadge";
import { X, MapPin } from "lucide-react";

// Right-side inspector. Reveals selection context. Otherwise shows "no selection".
export default function RightInspector() {
  const { selection, clearSelection, systems, agents, missions, approvals, sources } = useCell();

  const details = useMemo(() => {
    if (!selection) return null;
    const { kind, id } = selection;
    if (kind === "system")   return { kind, entity: systems.find((s) => s.id === id) };
    if (kind === "agent")    return { kind, entity: agents.find((a) => a.id === id) };
    if (kind === "mission")  return { kind, entity: missions.find((m) => m.id === id) };
    if (kind === "approval") return { kind, entity: approvals.find((a) => a.id === id) };
    if (kind === "source")   return { kind, entity: sources.find((s) => s.id === id) };
    return null;
  }, [selection, systems, agents, missions, approvals, sources]);

  return (
    <aside
      data-testid="right-inspector"
      className="w-80 shrink-0 border-l border-[#27272A] bg-[#0B0D10] flex flex-col"
    >
      <header className="h-9 border-b border-[#27272A] px-4 flex items-center justify-between bg-[#0F1115]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#00E5FF]" />
          <span className="font-display text-[11px] tracking-[0.2em] text-[#F8FAFC]">CONTEXT INSPECTOR</span>
        </div>
        {selection && (
          <button data-testid="clear-selection" onClick={clearSelection} className="text-[#52525B] hover:text-[#F8FAFC]">
            <X size={13} />
          </button>
        )}
      </header>

      {!details && (
        <div className="p-4 flex-1 flex flex-col items-start gap-3 text-[#52525B]">
          <MapPin size={20} className="text-[#27272A]" />
          <div className="font-data text-[11px] uppercase tracking-widest">No selection</div>
          <p className="text-[12px] leading-relaxed font-body">
            Select any system, agent, mission, source or approval to inspect it here.
            Everything shown is anchored to the Master L@B Map.
          </p>
          <div className="mt-2 font-data text-[10px] text-[#3F3F46] uppercase tracking-widest">
            THE MAP IS THE TRUTH
          </div>
        </div>
      )}

      {details && details.entity && (
        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B]">{details.kind}</div>
            <div className="font-display text-lg text-[#F8FAFC] mt-1">{details.entity.name || details.entity.codename || details.entity.title || details.entity.label}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {details.entity.truth && <DataStatePill state={details.entity.truth} />}
              {details.entity.state && <GovernanceBadge state={details.entity.state} />}
              {details.entity.trust && <DataStatePill state={details.entity.trust} />}
            </div>
          </div>

          <div className="border-t border-[#27272A] pt-3 space-y-2 font-data text-[11px]">
            {Object.entries(details.entity).map(([k, v]) => {
              if (["id", "name", "codename", "label", "title", "truth", "state", "trust"].includes(k)) return null;
              if (typeof v === "object" || v === undefined || v === null || v === "") return null;
              return (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-[#52525B] uppercase tracking-widest">{k}</span>
                  <span className="text-[#F8FAFC] text-right truncate">{String(v)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#27272A] pt-3">
            <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2">Governance</div>
            <div className="text-[11px] font-body text-[#94A3B8] leading-relaxed">
              Any action on this entity must pass governance policies. Approvals require operator <span className="text-[#00E5FF]">JR</span>.
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
