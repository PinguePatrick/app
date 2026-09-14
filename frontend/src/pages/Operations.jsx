import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import DataStatePill from "@/components/DataStatePill";
import GovernanceBadge from "@/components/GovernanceBadge";
import { cellApi } from "@/services/cellApi";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";

const LOOP = ["OBSERVE","LOCATE","UNDERSTAND","PLAN","GOVERNANCE","APPROVE","EXECUTE","VERIFY","RECORD","UPDATE MAP"];

function LoopBar({ phase }) {
  const idx = LOOP.findIndex((s) => s.startsWith(phase));
  return (
    <div className="grid grid-cols-10 gap-0.5 min-w-[440px]">
      {LOOP.map((s, i) => (
        <div key={s} className="flex flex-col items-center">
          <div
            className={`h-1.5 w-full ${i <= idx ? "bg-[#00E5FF]" : "bg-[#27272A]"} ${i === idx ? "shadow-[0_0_6px_#00E5FF]" : ""}`}
          />
          <span className="mt-1 text-[8px] font-data uppercase tracking-widest text-[#52525B] text-center">{s}</span>
        </div>
      ))}
    </div>
  );
}

export default function Operations() {
  const { missions, tasks, selection, select, refresh } = useCell();
  const activeMission = missions.find((m) => selection?.kind === "mission" && m.id === selection.id) || missions[0];
  const missionTasks = tasks.filter((t) => t.missionId === activeMission?.id || t.mission_id === activeMission?.id);

  const advance = async (id) => {
    try {
      await cellApi.advanceMission(id);
      toast("Phase advanced");
      await refresh();
    } catch { toast("Advance failed"); }
  };

  return (
    <div className="space-y-4" data-testid="operations">
      <Panel title="Missions" right={<span>{missions.length} total · loop = observe → update map</span>}>
        <ul className="divide-y divide-[#27272A]">
          {missions.map((m) => (
            <li
              key={m.id}
              onClick={() => select("mission", m.id)}
              className={`px-4 py-3 cursor-pointer hover:bg-[#16191E] ${activeMission?.id === m.id ? "bg-[#16191E]" : ""}`}
              data-testid={`mission-row-${m.id}`}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display text-[13px] text-[#F8FAFC] w-40 truncate">{m.codename}</span>
                <span className="font-body text-[12px] text-[#94A3B8] flex-1 truncate">{m.objective}</span>
                <DataStatePill state={m.truth} />
                <span className={`font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                  m.status === "ACTIVE" ? "border-[#10B981] text-[#10B981]" :
                  m.status === "BLOCKED" ? "border-[#DC2626] text-[#DC2626]" :
                  m.status === "SIMULATION" ? "border-[#14B8A6] text-[#14B8A6]" :
                  "border-[#D97706] text-[#F59E0B]"
                }`}>{m.status}</span>
              </div>
              <div className="mt-3">
                <LoopBar phase={m.phase} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {activeMission && (
        <Panel
          title={`Tasks · ${activeMission.codename}`}
          right={
            <div className="flex items-center gap-2">
              <span>{missionTasks.length} tasks</span>
              <button
                data-testid={`advance-mission-${activeMission.id}`}
                onClick={() => advance(activeMission.id)}
                className="flex items-center gap-1 px-2 py-0.5 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF18] font-data text-[10px] uppercase tracking-widest"
              >
                Advance phase <ChevronRight size={11} />
              </button>
            </div>
          }
        >
          {missionTasks.length === 0 ? (
            <div className="p-6 font-data text-[11px] uppercase tracking-widest text-[#52525B]">No tasks yet</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {missionTasks.map((t) => (
                <li key={t.id} className="px-4 py-2 grid grid-cols-[24px_1fr_180px_120px] items-center gap-3">
                  <span className={`h-2 w-2 ${
                    t.status === "DONE" ? "bg-[#10B981]" :
                    t.status === "RUNNING" ? "bg-[#00E5FF]" :
                    t.status === "AWAITING" ? "bg-[#D97706]" : "bg-[#71717A]"
                  }`} />
                  <span className="font-body text-[12px] text-[#F8FAFC]">{t.label}</span>
                  <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">→ {t.assignee}</span>
                  {t.status === "AWAITING" ? <GovernanceBadge state="PENDING" /> : (
                    <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">{t.status}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
