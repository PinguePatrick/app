import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import { History as HistoryIcon } from "lucide-react";

export default function History() {
  const { history } = useCell();
  return (
    <div className="space-y-4" data-testid="history">
      <Panel title="Recorded history" right={<span>{history.length} events · append-only</span>}>
        <ul className="divide-y divide-[#27272A]">
          {history.map((e) => (
            <li key={e.id} className="px-4 py-2 grid grid-cols-[24px_140px_120px_1fr] items-center gap-3 font-data text-[12px]"
                data-testid={`history-row-${e.id}`}>
              <HistoryIcon size={12} className="text-[#3F3F46]" />
              <span className="text-[#52525B]">{e.ts}</span>
              <span className="text-[#00E5FF] uppercase tracking-widest">{e.kind}</span>
              <span className="text-[#F8FAFC]">{e.text}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
