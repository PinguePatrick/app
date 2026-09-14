import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import DataStatePill from "@/components/DataStatePill";
import { BookOpen } from "lucide-react";

export default function Knowledge() {
  const { sources, select } = useCell();
  return (
    <div className="space-y-4" data-testid="knowledge">
      <Panel title="Sources of truth" right={<span>{sources.length} sources · known · unknown · stale · conflicting · simulated</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] font-data">
            <thead className="bg-[#0B0D10] text-[#52525B] uppercase tracking-widest text-[10px]">
              <tr>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Source</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Provenance</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Freshness</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Trust</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} onClick={() => select("source", s.id)} data-testid={`source-row-${s.id}`}
                    className="cursor-pointer hover:bg-[#16191E]">
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#F8FAFC] flex items-center gap-2">
                    <BookOpen size={12} className="text-[#00E5FF]" /> {s.label}
                  </td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{s.provenance}</td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{s.freshness}</td>
                  <td className="px-4 py-2 border-b border-[#27272A]"><DataStatePill state={s.trust} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Principle">
        <div className="p-6 font-body text-[13px] text-[#94A3B8] leading-relaxed max-w-3xl">
          Knowledge is only usable if it is anchored. When two sources disagree, CELL will mark them{" "}
          <span className="text-[#FB7185] font-data">CONFLICTING</span> and pause execution until{" "}
          <span className="text-[#00E5FF] font-data">JR</span> resolves the ambiguity.
          CELL does not fabricate anchors, connections, or provenance.
        </div>
      </Panel>
    </div>
  );
}
