import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import DataStatePill from "@/components/DataStatePill";

export default function Runtime() {
  const { runtime } = useCell();
  return (
    <div className="space-y-4" data-testid="runtime">
      <Panel title="Runtime hosts" right={<span>{runtime.length} hosts · mocked telemetry</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] font-data">
            <thead className="bg-[#0B0D10] text-[#52525B] uppercase tracking-widest text-[10px]">
              <tr>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Host</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Image</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">State</th>
                <th className="text-right px-4 py-2 border-b border-[#27272A]">CPU</th>
                <th className="text-right px-4 py-2 border-b border-[#27272A]">MEM</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Truth</th>
              </tr>
            </thead>
            <tbody>
              {runtime.map((r) => (
                <tr key={r.id} data-testid={`runtime-row-${r.id}`} className="hover:bg-[#16191E]">
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#F8FAFC]">{r.name}</td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{r.image}</td>
                  <td className="px-4 py-2 border-b border-[#27272A]">
                    <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-widest ${
                      r.state === "RUNNING" ? "border-[#10B981] text-[#10B981]" :
                      r.state === "IDLE" ? "border-[#27272A] text-[#94A3B8]" :
                      r.state === "SIMULATED" ? "border-[#14B8A6] text-[#14B8A6]" :
                      "border-[#DC2626] text-[#DC2626]"
                    }`}>{r.state}</span>
                  </td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-right text-[#F8FAFC]">{r.cpu}</td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-right text-[#F8FAFC]">{r.mem}</td>
                  <td className="px-4 py-2 border-b border-[#27272A]"><DataStatePill state={r.truth} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
