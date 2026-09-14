// "What Jr wants to do next" — §92 + §101
import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import { Sparkles, ShieldAlert, ChevronRight } from "lucide-react";

export default function NextFocus() {
  const { jr, autonomy } = useCell();
  const wants = jr?.wants_next || [];

  return (
    <Panel
      testId="panel-next-focus"
      title="What Jr wants to do next"
      right={<span className="normal-case tracking-normal">{autonomy?.next_focus}</span>}
    >
      <div className="p-4 space-y-2">
        {wants.length === 0 && (
          <div className="font-data text-[11px] uppercase tracking-widest text-[#52525B]">No proposals from Jr</div>
        )}
        {wants.map((w) => (
          <div
            key={w.id}
            data-testid={`wants-next-${w.id}`}
            className={`flex items-center gap-3 px-3 py-2 border ${w.requires_father ? "border-[#00E5FF33] bg-[#00E5FF08]" : "border-[#27272A] bg-[#0B0D10]"}`}
          >
            <Sparkles size={12} className={w.requires_father ? "text-[#00E5FF]" : "text-[#94A3B8]"} />
            <span className="flex-1 font-body text-[12px] text-[#F8FAFC]">{w.text}</span>
            <span className={`font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
              w.risk === "HIGH"   ? "border-[#E11D48] text-[#FB7185]" :
              w.risk === "MEDIUM" ? "border-[#D97706] text-[#F59E0B]" :
                                    "border-[#27272A] text-[#94A3B8]"
            }`}>RISK {w.risk}</span>
            {w.requires_father && (
              <span className="flex items-center gap-1 font-data text-[10px] uppercase tracking-widest text-[#00E5FF] px-1.5 py-0.5 border border-[#00E5FF]">
                <ShieldAlert size={10} /> FATHER
              </span>
            )}
            <ChevronRight size={13} className="text-[#3F3F46]" />
          </div>
        ))}
      </div>
    </Panel>
  );
}
