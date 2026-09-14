import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import DataStatePill from "@/components/DataStatePill";

export default function Memory() {
  const { memory } = useCell();
  const groups = ["long-term", "episodic", "semantic", "working"];
  return (
    <div className="space-y-4" data-testid="memory">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map((g) => {
          const rows = memory.filter((m) => m.scope === g);
          return (
            <Panel key={g} title={`${g} memory`} right={<span>{rows.length} entries</span>}>
              {rows.length === 0 ? (
                <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#52525B]">No entries</div>
              ) : (
                <ul className="divide-y divide-[#27272A]">
                  {rows.map((m) => (
                    <li key={m.id} className="px-4 py-2 flex items-center gap-3 font-data text-[12px]">
                      <span className="text-[#00E5FF] w-24 truncate">{m.updated}</span>
                      <span className="text-[#F8FAFC] flex-1 truncate">{m.key}</span>
                      <span className="text-[#52525B] uppercase tracking-widest text-[10px]">{m.provenance}</span>
                      {m.conflict && <DataStatePill state="CONFLICTING" size="xs" />}
                      {m.simulated && <DataStatePill state="SIMULATED" size="xs" />}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
