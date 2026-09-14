import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import DataStatePill from "@/components/DataStatePill";
import { Users2 } from "lucide-react";

export default function EliteTeams() {
  const { teams, agents, select } = useCell();

  const roster = (teamName) => agents.filter((a) => a.team.toLowerCase() === teamName.toLowerCase());

  return (
    <div className="space-y-4" data-testid="elite-teams">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((t) => (
          <Panel key={t.id} testId={`team-${t.id}`} title={t.name} right={<span>{t.members} agents · {t.missions} missions</span>}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 border border-[#27272A] flex items-center justify-center bg-[#0B0D10]">
                  <Users2 size={14} className="text-[#00E5FF]" />
                </div>
                <p className="text-[12px] text-[#94A3B8] font-body leading-relaxed">{t.charter}</p>
              </div>
              <div className="mt-4 space-y-2">
                {roster(t.name).length === 0 && (
                  <div className="text-[11px] font-data text-[#52525B] uppercase tracking-widest">No agents deployed</div>
                )}
                {roster(t.name).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => select("agent", a.id)}
                    className="flex items-center gap-2 px-2 py-1.5 border border-[#27272A] hover:border-[#3F3F46] cursor-pointer bg-[#0B0D10]"
                    data-testid={`agent-row-${a.id}`}
                  >
                    <div className="h-1.5 w-1.5" style={{ background: a.posture === "OFFLINE" ? "#DC2626" : a.posture === "SIMULATING" ? "#14B8A6" : "#10B981" }} />
                    <span className="font-display text-[12px] text-[#F8FAFC]">{a.name}</span>
                    <span className="ml-auto flex items-center gap-2">
                      <span className="font-data text-[10px] text-[#52525B] uppercase tracking-widest">{a.posture}</span>
                      <DataStatePill state={a.truth} size="xs" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
