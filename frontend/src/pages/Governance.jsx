import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import GovernanceBadge from "@/components/GovernanceBadge";
import { toast } from "sonner";
import { Check, X, ShieldAlert } from "lucide-react";
import { cellApi } from "@/services/cellApi";

export default function Governance() {
  const { approvals, policies, select, refresh } = useCell();

  const act = async (a, verb) => {
    try {
      await cellApi.decideApproval(a.id, verb);
      toast(`${verb} recorded for ${a.title}.`);
      await refresh();
    } catch (e) {
      toast(e?.response?.data?.detail || "Action failed");
    }
  };

  return (
    <div className="space-y-4" data-testid="governance">
      <Panel title="Approval queue" right={<span>{approvals.length} items · operator: JR</span>}>
        <ul className="divide-y divide-[#27272A]">
          {approvals.map((a) => (
            <li key={a.id} className="px-4 py-3 flex flex-wrap items-center gap-3" data-testid={`approval-row-${a.id}`}>
              <ShieldAlert size={14} className="text-[#00E5FF]" />
              <div className="flex-1 min-w-[280px]">
                <div className="font-display text-[13px] text-[#F8FAFC]">{a.title}</div>
                <div className="font-data text-[10px] text-[#52525B] uppercase tracking-widest mt-0.5">
                  by {a.requester} · policy {a.policy} · risk {a.risk}
                </div>
              </div>
              <GovernanceBadge state={a.state} />
              <div className="flex items-center gap-1">
                <button
                  data-testid={`approve-${a.id}`}
                  onClick={() => act(a, "APPROVE")}
                  disabled={a.state === "APPROVED" || a.state === "BLOCKED"}
                  className="flex items-center gap-1 px-2 py-1 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF18] disabled:opacity-30 disabled:cursor-not-allowed font-data text-[10px] uppercase tracking-widest"
                >
                  <Check size={11} /> Approve
                </button>
                <button
                  data-testid={`block-${a.id}`}
                  onClick={() => act(a, "BLOCK")}
                  disabled={a.state === "APPROVED" || a.state === "BLOCKED"}
                  className="flex items-center gap-1 px-2 py-1 border border-[#DC2626] text-[#DC2626] hover:bg-[#DC262618] disabled:opacity-30 disabled:cursor-not-allowed font-data text-[10px] uppercase tracking-widest"
                >
                  <X size={11} /> Block
                </button>
                <button
                  onClick={() => select("approval", a.id)}
                  className="px-2 py-1 border border-[#27272A] text-[#94A3B8] hover:border-[#3F3F46] font-data text-[10px] uppercase tracking-widest"
                >
                  Inspect
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Active policies" right={<span>{policies.length} policies</span>}>
        <ul className="divide-y divide-[#27272A]">
          {policies.map((p) => (
            <li key={p.id} className="px-4 py-2 grid grid-cols-[100px_1fr_100px] gap-3 items-center font-data text-[12px]">
              <span className="text-[#00E5FF]">{p.id}</span>
              <span className="text-[#F8FAFC]">{p.label}</span>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border justify-self-end ${
                p.severity === "HIGH" ? "border-[#E11D48] text-[#FB7185]" :
                p.severity === "MEDIUM" ? "border-[#D97706] text-[#F59E0B]" :
                "border-[#27272A] text-[#94A3B8]"
              }`}>{p.severity}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
