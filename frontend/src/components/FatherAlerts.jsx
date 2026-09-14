// "What needs Father?" — §93 top-priority alert row.
import React from "react";
import { useCell } from "@/state/CellContext";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowUpRight } from "lucide-react";

export default function FatherAlerts() {
  const { approvals, risks, select } = useCell();
  const navigate = useNavigate();

  const pendingApprovals = approvals.filter((a) => a.state === "PENDING");
  const highRisks = risks.filter((r) => r.level === "HIGH");

  if (pendingApprovals.length === 0 && highRisks.length === 0) {
    return (
      <div
        data-testid="father-alerts-empty"
        className="border border-[#10B981] bg-[#10B98110] text-[#10B981] font-data text-[11px] uppercase tracking-widest px-4 py-2 flex items-center gap-2"
      >
        <ShieldAlert size={12} />
        Nothing requires Father right now.
      </div>
    );
  }

  return (
    <div data-testid="father-alerts" className="border border-[#00E5FF] bg-[#00E5FF10]">
      <div className="px-4 py-2 border-b border-[#00E5FF33] flex items-center gap-2">
        <ShieldAlert size={13} className="text-[#00E5FF]" />
        <span className="font-display text-[12px] tracking-[0.2em] text-[#00E5FF] uppercase">
          FATHER APPROVAL REQUIRED
        </span>
        <span className="ml-auto font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">
          {pendingApprovals.length} approval{pendingApprovals.length === 1 ? "" : "s"}
          {highRisks.length > 0 && ` · ${highRisks.length} high risk${highRisks.length === 1 ? "" : "s"}`}
        </span>
      </div>
      <ul className="divide-y divide-[#00E5FF22]">
        {pendingApprovals.map((a) => (
          <li
            key={a.id}
            data-testid={`father-alert-${a.id}`}
            onClick={() => { select("approval", a.id); navigate("/governance"); }}
            className="px-4 py-2 flex items-center gap-3 hover:bg-[#00E5FF18] cursor-pointer"
          >
            <span className="font-display text-[12px] text-[#F8FAFC] flex-1">{a.title}</span>
            <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">by {a.requester}</span>
            <span className={`font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
              a.risk === "HIGH"   ? "border-[#E11D48] text-[#FB7185]" :
              a.risk === "MEDIUM" ? "border-[#D97706] text-[#F59E0B]" :
                                    "border-[#27272A] text-[#94A3B8]"
            }`}>RISK {a.risk}</span>
            <span className="font-data text-[10px] uppercase tracking-widest text-[#00E5FF]">{a.policy}</span>
            <ArrowUpRight size={12} className="text-[#00E5FF]" />
          </li>
        ))}
        {highRisks.map((r) => (
          <li key={r.id} className="px-4 py-2 flex items-center gap-3 text-[#FB7185]">
            <span className="font-data text-[10px] uppercase tracking-widest">HIGH RISK</span>
            <span className="font-body text-[12px] flex-1">{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
