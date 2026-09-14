import React from "react";
import { useNavigate } from "react-router-dom";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import { History as HistoryIcon, ArrowUpRight } from "lucide-react";

export default function History() {
  const { history } = useCell();
  const navigate = useNavigate();

  const clickable = (kind) => ["OBSERVATION_CREATED","ARTIFACT_CREATED","ARTIFACT_VERIFIED","JOB","APPROVAL"].includes(kind);
  const targetFor = (kind) => (kind.startsWith("OBSERVATION") || kind.startsWith("ARTIFACT") || kind === "JOB") ? "/operations" : "/governance";

  return (
    <div className="space-y-4" data-testid="history">
      <Panel title="Recorded history" right={<span>{history.length} events · append-only · click to open</span>}>
        <ul className="divide-y divide-[#27272A]">
          {history.map((e) => {
            const isClickable = clickable(e.kind);
            return (
              <li key={e.id}
                  onClick={isClickable ? () => navigate(targetFor(e.kind)) : undefined}
                  className={`px-4 py-2 grid grid-cols-[24px_140px_140px_1fr_16px] items-center gap-3 font-data text-[12px] ${
                    isClickable ? "cursor-pointer hover:bg-[#16191E]" : ""
                  }`}
                  data-testid={`history-row-${e.id}`}>
                <HistoryIcon size={12} className="text-[#3F3F46]" />
                <span className="text-[#52525B]">{e.ts}</span>
                <span className="text-[#00E5FF] uppercase tracking-widest">{e.kind}</span>
                <span className="text-[#F8FAFC]">{e.text}</span>
                {isClickable ? <ArrowUpRight size={11} className="text-[#3F3F46]" /> : <span />}
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
