// Governance v2 — Diff as first-class object, Verification lifecycle, Routing settings.
import React, { useState } from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import GovernanceBadge from "@/components/GovernanceBadge";
import DiffViewer from "@/components/DiffViewer";
import { cellApi } from "@/services/cellApi";
import { toast } from "sonner";
import { Check, X, ShieldAlert, FileDiff, Shield, CheckCircle2, CircleAlert } from "lucide-react";

const GOV_COLOR = {
  "SAFE":              "#10B981",
  "CONTROLLED":        "#00E5FF",
  "FATHER APPROVAL":   "#D97706",
  "DO NOT TEST":       "#DC2626",
};

function GovClass({ value }) {
  const c = GOV_COLOR[value] || "#94A3B8";
  return (
    <span className="font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border" style={{ color: c, borderColor: c, background: `${c}18` }}>
      {value}
    </span>
  );
}

export default function Governance() {
  const { approvals, policies, verifications, routing, select, refresh } = useCell();
  const [openDiff, setOpenDiff] = useState(null);

  const act = async (a, verb) => {
    try {
      await cellApi.decideApproval(a.id, verb);
      toast(verb === "APPROVE" ? `Approved. Job spawned for ${a.title}.` : `${a.title} blocked.`);
      await refresh();
    } catch (e) {
      toast(e?.response?.data?.detail || "Action failed");
    }
  };

  return (
    <div className="space-y-4" data-testid="governance">
      <Panel title="Approval queue" right={<span>{approvals.length} items · operator: JR · every approval carries a Diff</span>}>
        <ul className="divide-y divide-[#27272A]">
          {approvals.map((a) => (
            <li key={a.id} className="px-4 py-3" data-testid={`approval-row-${a.id}`}>
              <div className="flex flex-wrap items-center gap-3">
                <ShieldAlert size={14} className="text-[#00E5FF]" />
                <div className="flex-1 min-w-[280px]">
                  <div className="font-display text-[13px] text-[#F8FAFC]">{a.title}</div>
                  <div className="font-data text-[10px] text-[#52525B] uppercase tracking-widest mt-0.5">
                    by {a.requester} · policy {a.policy} · risk {a.risk}
                  </div>
                </div>
                <GovClass value={a.gov_class || "CONTROLLED"} />
                <GovernanceBadge state={a.state} />
                <div className="flex items-center gap-1">
                  {a.diff_id && (
                    <button data-testid={`view-diff-${a.id}`} onClick={() => setOpenDiff(a.diff_id)}
                            className="flex items-center gap-1 px-2 py-1 border border-[#27272A] text-[#94A3B8] hover:border-[#00E5FF] hover:text-[#00E5FF] font-data text-[10px] uppercase tracking-widest">
                      <FileDiff size={11} /> Diff
                    </button>
                  )}
                  <button data-testid={`approve-${a.id}`} onClick={() => act(a, "APPROVE")}
                          disabled={a.state === "APPROVED" || a.state === "BLOCKED"}
                          className="flex items-center gap-1 px-2 py-1 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF18] disabled:opacity-30 disabled:cursor-not-allowed font-data text-[10px] uppercase tracking-widest">
                    <Check size={11} /> Approve
                  </button>
                  <button data-testid={`block-${a.id}`} onClick={() => act(a, "BLOCK")}
                          disabled={a.state === "APPROVED" || a.state === "BLOCKED"}
                          className="flex items-center gap-1 px-2 py-1 border border-[#DC2626] text-[#DC2626] hover:bg-[#DC262618] disabled:opacity-30 disabled:cursor-not-allowed font-data text-[10px] uppercase tracking-widest">
                    <X size={11} /> Block
                  </button>
                  <button onClick={() => select("approval", a.id)}
                          className="px-2 py-1 border border-[#27272A] text-[#94A3B8] hover:border-[#3F3F46] font-data text-[10px] uppercase tracking-widest">
                    Inspect
                  </button>
                </div>
              </div>
              {a.verification_id && (
                <div className="mt-2 pl-6 font-data text-[10px] uppercase tracking-widest text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 size={11} /> Verified · {a.verification_id}
                </div>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Verification record" right={<span>{verifications.length} recorded</span>}>
          {verifications.length === 0 ? (
            <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#52525B]">No verifications</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {verifications.map((v) => (
                <li key={v.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {v.state === "PASSED" ? <CheckCircle2 size={13} className="text-[#10B981]" /> : <CircleAlert size={13} className="text-[#E11D48]" />}
                    <span className="font-display text-[12px] text-[#F8FAFC] flex-1">{v.target_kind}:{v.target_id}</span>
                    <span className="font-data text-[10px] uppercase tracking-widest text-[#52525B]">{v.ts}</span>
                    <span className={`font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
                      v.state === "PASSED" ? "border-[#10B981] text-[#10B981]" : "border-[#E11D48] text-[#FB7185]"
                    }`}>{v.state}</span>
                  </div>
                  <div className="mt-1 pl-6 font-body text-[12px] text-[#94A3B8]">{v.evidence}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Routing" right={<span className="text-[#14B8A6]">reference only — not connected</span>}>
          <div className="p-4 space-y-3" data-testid="routing-panel">
            <div className="grid grid-cols-[140px_1fr] gap-2 font-data text-[12px]">
              <span className="text-[#52525B] uppercase tracking-widest">Mode</span>
              <span className="text-[#F8FAFC]" data-testid="routing-mode">{routing?.mode || "—"}</span>
              <span className="text-[#52525B] uppercase tracking-widest">Shield</span>
              <span className="text-[#F8FAFC]">{routing?.shield ? "ON" : "OFF"}</span>
              <span className="text-[#52525B] uppercase tracking-widest">Identity</span>
              <span className="text-[#F8FAFC]">{routing?.frontend_identity || "—"}</span>
            </div>
            <div className="pt-3 border-t border-[#27272A] font-body text-[11px] text-[#94A3B8]">
              <Shield size={11} className="inline mr-1 text-[#00E5FF]" />
              {routing?.note || "Privacy routing is displayed as a governance reference; changes are disabled until a real routing service is connected."}
            </div>
          </div>
        </Panel>
      </div>

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

      {openDiff && <DiffViewer diffId={openDiff} onClose={() => setOpenDiff(null)} />}
    </div>
  );
}
