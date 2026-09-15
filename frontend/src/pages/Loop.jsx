import React, { useMemo, useState } from "react";
import { useCell } from "@/state/CellContext";
import { cellApi } from "@/services/cellApi";
import Panel from "@/components/Panel";
import GovernanceBadge from "@/components/GovernanceBadge";
import DataStatePill from "@/components/DataStatePill";
import DiffViewer from "@/components/DiffViewer";
import { CheckCircle2, Circle, GitPullRequest, ShieldAlert, FileDiff, ArrowRight, Loader2 } from "lucide-react";

const STAGES = [
  ["PROPOSED", "A proposal exists"],
  ["REVIEW", "Human review is required"],
  ["APPROVED", "Father approval is recorded"],
  ["BUILDING", "The approved job is progressing"],
  ["TESTING", "Verification is in progress"],
  ["VERIFIED", "The result passed verification"],
];

const STAGE_INDEX = {
  DISCOVERED: 0,
  PROPOSED: 0,
  PENDING: 1,
  REVIEW: 1,
  APPROVED: 2,
  BUILDING: 3,
  TESTING: 4,
  VERIFIED: 5,
};

const TERMINAL = new Set(["VERIFIED", "FAILED", "REJECTED", "VERIFICATION_FAILED"]);

function itemStage(item) {
  return STAGE_INDEX[String(item?.state || item?.status || "").toUpperCase()] ?? 0;
}

export default function Loop() {
  const { proposals, approvals, jobs, verifications, events, select, refresh } = useCell();
  const [diffId, setDiffId] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const pending = approvals.filter((a) => String(a.state).toUpperCase() === "PENDING");
  const activeJobs = jobs.filter((j) => !TERMINAL.has(String(j.state).toUpperCase()));
  const verified = verifications.filter((v) => v.state === "PASSED" || v.status === "PASSED");

  const reachedStages = useMemo(() => {
    const all = [...proposals, ...approvals, ...jobs];
    return STAGES.map((_, index) => all.some((item) => itemStage(item) >= index));
  }, [proposals, approvals, jobs]);

  async function decide(id, decision) {
    const key = `${decision}:${id}`;
    setBusy(key);
    setMessage("");
    try {
      await cellApi.decideApproval(id, decision);
      setMessage(`Approval ${decision.toLowerCase()}d. CELL state refreshed.`);
      await refresh();
    } catch (error) {
      setMessage(`Approval failed: ${error?.response?.data?.detail || error?.message || "request failed"}`);
    } finally {
      setBusy("");
    }
  }

  async function advance(id) {
    setBusy(`advance:${id}`);
    setMessage("");
    try {
      const result = await cellApi.advanceJob(id);
      setMessage(`${result?.id || id} advanced to ${result?.state || "next state"}.`);
      await refresh();
    } catch (error) {
      setMessage(`Job advance failed: ${error?.response?.data?.detail || error?.message || "request failed"}`);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-4" data-testid="loop-page">
      <div className="border border-[#27272A] bg-[#0F1115] p-6 grid-bg">
        <div className="font-data text-[10px] uppercase tracking-[0.3em] text-[#00E5FF]">JRCOCKPIT // GOVERNED LOOP</div>
        <div className="flex items-end justify-between gap-4 flex-wrap mt-2">
          <div>
            <h1 className="font-display text-4xl text-[#F8FAFC]">PROPOSE → APPROVE → VERIFY.</h1>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[#94A3B8]">
              Review proposals, record approval, progress the governed job, and inspect verification. This page does not execute code or bypass approval.
            </p>
          </div>
          <div className="font-data text-[10px] uppercase tracking-widest text-[#F59E0B] border border-[#D97706] px-3 py-2">
            NO DIRECT EXECUTION
          </div>
        </div>
        {message && <div className="mt-4 border border-[#27272A] bg-[#0B0D10] px-3 py-2 font-data text-[10px] uppercase tracking-widest text-[#CBD5E1]">{message}</div>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Proposals", proposals.length],
          ["Awaiting approval", pending.length],
          ["Active jobs", activeJobs.length],
          ["Verified", verified.length],
        ].map(([label, value]) => (
          <Panel key={label} title={label}>
            <div className="px-4 py-5 font-data text-3xl text-[#F8FAFC]">{value}</div>
          </Panel>
        ))}
      </div>

      <Panel title="Governed lifecycle" right={<span>aggregate state from CELL</span>}>
        <div className="grid grid-cols-2 md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-[#27272A]">
          {STAGES.map(([stage, description], index) => (
            <div key={stage} className="p-4 min-h-[120px]">
              {reachedStages[index] ? <CheckCircle2 size={15} className="text-[#10B981]" /> : <Circle size={15} className="text-[#3F3F46]" />}
              <div className="mt-3 font-data text-[11px] tracking-widest text-[#F8FAFC]">{stage}</div>
              <div className="mt-1 font-body text-[11px] text-[#71717A] leading-relaxed">{description}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Approval queue" right={<span>{pending.length} pending</span>}>
          {pending.length === 0 ? (
            <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#10B981]">No pending approvals</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {pending.map((a) => {
                const approveKey = `APPROVE:${a.id}`;
                const blockKey = `BLOCK:${a.id}`;
                return (
                  <li key={a.id} data-testid={`loop-approval-${a.id}`} className="p-4 hover:bg-[#16191E]">
                    <div className="flex items-center gap-3">
                      <ShieldAlert size={14} className="text-[#F59E0B] shrink-0" />
                      <button onClick={() => select("approval", a.id)} className="min-w-0 flex-1 text-left">
                        <div className="font-display text-[12px] text-[#F8FAFC] truncate">{a.title}</div>
                        <div className="mt-1 font-data text-[10px] text-[#71717A] uppercase tracking-widest">{a.policy || "governance required"}</div>
                      </button>
                      <GovernanceBadge state={a.state} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 pl-7">
                      {a.diff_id && <button data-testid={`loop-diff-${a.id}`} onClick={() => setDiffId(a.diff_id)} className="inline-flex items-center gap-1 border border-[#3F3F46] px-2 py-1 font-data text-[9px] uppercase tracking-widest text-[#CBD5E1] hover:border-[#00E5FF]"><FileDiff size={11} /> Diff</button>}
                      <button data-testid={`loop-approve-${a.id}`} disabled={!!busy} onClick={() => decide(a.id, "APPROVE")} className="inline-flex items-center gap-1 border border-[#10B981] px-2 py-1 font-data text-[9px] uppercase tracking-widest text-[#10B981] disabled:opacity-40">{busy === approveKey ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Approve</button>
                      <button data-testid={`loop-block-${a.id}`} disabled={!!busy} onClick={() => decide(a.id, "BLOCK")} className="inline-flex items-center gap-1 border border-[#FB7185] px-2 py-1 font-data text-[9px] uppercase tracking-widest text-[#FB7185] disabled:opacity-40">{busy === blockKey ? <Loader2 size={11} className="animate-spin" /> : <ShieldAlert size={11} />} Block</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Jobs → verification" right={<span>{jobs.length} jobs</span>}>
          {jobs.length === 0 ? (
            <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#52525B]">No jobs recorded</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {jobs.slice(0, 8).map((job) => {
                const verification = verifications.find((v) => v.id === job.verification_id || v.job_id === job.id || v.target_id === job.id);
                const terminal = TERMINAL.has(String(job.state).toUpperCase());
                return (
                  <li key={job.id} data-testid={`loop-job-${job.id}`} className="p-4 hover:bg-[#16191E]">
                    <div className="flex items-center gap-3">
                      <GitPullRequest size={14} className="text-[#00E5FF] shrink-0" />
                      <button onClick={() => select("job", job.id)} className="min-w-0 flex-1 text-left">
                        <div className="font-display text-[12px] text-[#F8FAFC] truncate">{job.title || job.id}</div>
                        <div className="mt-1 font-data text-[10px] text-[#71717A] uppercase tracking-widest">{job.state} · {job.progress ?? 0}%</div>
                      </button>
                      <DataStatePill state={verification ? (verification.state === "PASSED" ? "KNOWN" : "UNKNOWN") : "UNKNOWN"} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 pl-7">
                      {verification ? (
                        <span className="font-data text-[9px] uppercase tracking-widest text-[#10B981]">Verification: {verification.state || verification.status}</span>
                      ) : (
                        <span className="font-data text-[9px] uppercase tracking-widest text-[#71717A]">No verification record yet</span>
                      )}
                      {!terminal && <button data-testid={`loop-advance-${job.id}`} disabled={!!busy} onClick={() => advance(job.id)} className="ml-auto inline-flex items-center gap-1 border border-[#00E5FF] px-2 py-1 font-data text-[9px] uppercase tracking-widest text-[#00E5FF] disabled:opacity-40">{busy === `advance:${job.id}` ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />} Advance state</button>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Loop audit trail" right={<span>latest CELL events</span>}>
        <ul className="divide-y divide-[#27272A] max-h-[260px] overflow-y-auto">
          {events.slice(-12).reverse().map((event) => (
            <li key={event.id} className="px-4 py-2 grid grid-cols-[75px_105px_1fr] gap-2 font-data text-[10px]">
              <span className="text-[#52525B]">{event.ts}</span>
              <span className="text-[#00E5FF] uppercase tracking-widest">{event.kind}</span>
              <span className="text-[#CBD5E1] truncate">{event.text}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <DiffViewer diffId={diffId} onClose={() => setDiffId(null)} />
    </div>
  );
}
