// Separate Jr identity + CELL identity cards (§36, §37 — never collapse).
import React from "react";
import Panel from "@/components/Panel";
import { useCell } from "@/state/CellContext";
import { Brain, Cpu } from "lucide-react";

function IdentityCard({ testId, title, name, icon: Icon, posture, action, note, accent }) {
  return (
    <Panel testId={testId} title={title}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 border border-[#27272A] bg-[#0B0D10] flex items-center justify-center" style={{ borderColor: accent }}>
            <Icon size={14} style={{ color: accent }} />
          </div>
          <div>
            <div className="font-display text-lg text-[#F8FAFC]">{name}</div>
            <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B]">POSTURE · {posture}</div>
          </div>
        </div>
        <div className="mt-3 border-l-2 pl-3 font-body text-[12px] text-[#94A3B8] leading-relaxed" style={{ borderColor: accent }}>
          {action}
        </div>
        {note && <div className="mt-2 font-data text-[10px] text-[#52525B] uppercase tracking-widest">{note}</div>}
      </div>
    </Panel>
  );
}

export default function JrCellStatus() {
  const { jr, cell } = useCell();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <IdentityCard
        testId="identity-cell"
        title="CELL — operational brain"
        name="CELL"
        icon={Cpu}
        posture={cell?.posture || "…"}
        action={cell?.current_action || "…"}
        note={`v ${cell?.version || ""}`}
        accent="#00E5FF"
      />
      <IdentityCard
        testId="identity-jr"
        title="Jr — AI participant"
        name={jr?.handle || "Jr"}
        icon={Brain}
        posture={jr?.posture || "…"}
        action={jr?.current_thought || "Thinking…"}
        note={`${(jr?.wants_next || []).length} proposals pending`}
        accent="#14B8A6"
      />
    </div>
  );
}
