// Autonomy row — §7 Drive concept. Answers "what is Jr currently allowed to do?"
import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import { Activity, Check, ShieldAlert } from "lucide-react";

const modeColor = {
  SAFE:               "#10B981",
  CONTROLLED:         "#00E5FF",
  "FATHER APPROVAL":  "#D97706",
  "DO NOT TEST":      "#DC2626",
};

export default function AutonomyPanel() {
  const { autonomy } = useCell();
  if (!autonomy) return null;
  const c = modeColor[autonomy.mode] || "#94A3B8";

  return (
    <Panel
      testId="panel-autonomy"
      title="Autonomy scope"
      right={
        <span className="flex items-center gap-2">
          <Activity size={11} className="text-[#00E5FF] blink" />
          heartbeat {autonomy.heartbeat}
        </span>
      }
    >
      <div className="p-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <div className="border border-[#27272A] bg-[#0B0D10] p-4">
          <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B]">Mode</div>
          <div className="mt-2 font-display text-lg" style={{ color: c }} data-testid="autonomy-mode">{autonomy.mode}</div>
          <div className="mt-3 font-body text-[11px] text-[#94A3B8] leading-relaxed">{autonomy.cadence}</div>
          <div className="mt-3 font-data text-[10px] text-[#52525B] uppercase tracking-widest">
            LAST VERIFY {autonomy.last_verification_iso?.slice(11, 19)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-data text-[10px] uppercase tracking-widest text-[#10B981] mb-2 flex items-center gap-1">
              <Check size={11} /> ALLOWED
            </div>
            <ul className="space-y-1.5">
              {(autonomy.allowed || []).map((x) => (
                <li key={x} className="font-body text-[12px] text-[#F8FAFC] pl-3 border-l border-[#10B981]/40">{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-data text-[10px] uppercase tracking-widest text-[#00E5FF] mb-2 flex items-center gap-1">
              <ShieldAlert size={11} /> REQUIRES FATHER
            </div>
            <ul className="space-y-1.5">
              {(autonomy.requires_father || []).map((x) => (
                <li key={x} className="font-body text-[12px] text-[#F8FAFC] pl-3 border-l border-[#00E5FF]/40">{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  );
}
