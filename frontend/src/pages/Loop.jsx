import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import GovernanceBadge from "@/components/GovernanceBadge";
import DataStatePill from "@/components/DataStatePill";
import { CheckCircle2, Circle, GitPullRequest, ShieldAlert } from "lucide-react";

const STAGES = [
  ["PROPOSED", "AI or operator proposal exists"],
  ["REVIEW", "Human review is required"],
  ["APPROVED", "Father approval is recorded"],
  ["BUILDING", "A job is being processed"],
  ["TESTING", "Verification is in progress"],
  ["VERIFIED", "The result passed verification"],
];

function stageIndex(item) {
  const state = String(item?.state || item?.status || "").toUpperCase();
  const aliases = { PENDING: 1, APPROVED: 2, DISCOVERED: 0, PROPOSED: 0, REVIEW: 1, BUILDING: 3, TESTING: 4, VERIFIED: 5 };
  return aliases[state] ?? 0;
}

export default function Loop() {
  const { proposals, approvals, jobs, verifications, events, select } = useCell();

  const pending = approvals.filter((a) => a.state === "PENDING");
  const activeJobs = jobs.filter((j) => !["VERIFIED", "FAILED", "REJECTED", "VERIFICATION_FAILED"].includes(j.state));
  const verified = verifications.filter((v) => v.state === "PASSED" || v.status === "PASSED");

  return (
    <div className="space-y-4" data-testid="loop-page">
      <div className="border border-[#27272A] bg-[#0F1115] p-6 grid-bg">
        <div className="font-data text-[10px] uppercase tracking-[0.3em] text-[#00E5FF]">JRCOCKPIT // GOVERNED LOOP</div>
        <div className="flex items-end justify-between gap-4 flex-wrap mt-2">
          <div>
            <h1 className="font-display text-4xl text-[#F8FAFC]">PROPOSE → APPROVE → VERIFY.</h1>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[#94A3B8]">
              The Loop is an operator workflow, not an autonomous execution shortcut. This surface only reports state already present in CELL.
            </p>
          </div>
          <div className="font-data text-[10px] uppercase tracking-widest text-[#F59E0B] border border-[#D97706] px-3 py-2">
            NO DIRECT EXECUTION
          </div>
        </div>
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

      <Panel title="Governed lifecycle" right={<span>state from CELL</span>}>
        <div className="grid grid-cols-2 md:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-[#27272A]">
          {STAGES.map(([stage, description], index) => {
            const reached = Math.max(
              ...jobs.map(stageIndex),
              ...approvals.map(stageIndex),
              ...proposals.map(stageIndex),
              -1,
            ) >= index;
            return (
              <div key={stage} className="p-4 min-h-[120px]">
                {reached ? <CheckCircle2 size={15} className="text-[#10B981]" /> : <Circle size={15} className="text-[#3F3F46]" />}
                <div className="mt-3 font-data text-[11px] tracking-widest text-[#F8FAFC]">{stage}</div>
                <div className="mt-1 font-body text-[11px] text-[#71717A] leading-relaxed">{description}</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Approval queue" right={<span>{pending.length} pending</span>}>
          {pending.length === 0 ? (
            <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#10B981]">No pending approvals</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {pending.map((a) => (
                <li key={a.id} data-testid={`loop-approval-${a.id}`} onClick={() => select("approval", a.id)} className="p-4 hover:bg-[#16191E] cursor-pointer flex items-center gap-3">
                  <ShieldAlert size={14} className="text-[#F59E0B]" />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[12px] text-[#F8FAFC] truncate">{a.title}</div>
                    <div className="mt-1 font-data text-[10px] text-[#71717A] uppercase tracking-widest">{a.policy || "governance required"}</div>
                  </div>
                  <GovernanceBadge state={a.state} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Jobs → verification" right={<span>{jobs.length} jobs</span>}>
          {jobs.length === 0 ? (
            <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#52525B]">No jobs recorded</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {jobs.slice(0, 8).map((job) => {
                const verification = verifications.find((v) => v.id === job.verification_id || v.job_id === job.id);
                return (
                  <li key={job.id} data-testid={`loop-job-${job.id}`} onClick={() => select("job", job.id)} className="p-4 hover:bg-[#16191E] cursor-pointer flex items-center gap-3">
                    <GitPullRequest size={14} className="text-[#00E5FF]" />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[12px] text-[#F8FAFC] truncate">{job.id}</div>
                      <div className="mt-1 font-data text-[10px] text-[#71717A] uppercase tracking-widest">{job.state} · {job.progress ?? 0}%</div>
                    </div>
                    <DataStatePill state={verification ? (verification.state === "PASSED" ? "KNOWN" : "UNKNOWN") : "UNKNOWN"} />
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
    </div>
  );
}
