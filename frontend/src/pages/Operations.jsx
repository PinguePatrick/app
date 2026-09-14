// Work surface — folds Jobs + Builds + Loop + Verification into one governed lifecycle view.
// Nav name stays "OPERATIONS" per user preference.
import React, { useMemo, useState } from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import DataStatePill from "@/components/DataStatePill";
import GovernanceBadge from "@/components/GovernanceBadge";
import BuildLifecycleBar, { JOB_FAILURE } from "@/components/BuildLifecycleBar";
import { cellApi } from "@/services/cellApi";
import { toast } from "sonner";
import { ChevronRight, Play, XCircle, CheckCircle2, CircleAlert } from "lucide-react";

const TABS = [
  { id: "jobs",       label: "Jobs" },
  { id: "builds",     label: "Governed Builds" },
  { id: "loop",       label: "Mission Loop" },
  { id: "verify",     label: "Verification" },
];

function StateChip({ state }) {
  const c = state === "VERIFIED" ? "#10B981"
          : state === "FAILED" || state === "VERIFICATION_FAILED" || state === "REJECTED" ? "#E11D48"
          : state === "TESTING" || state === "BUILDING" ? "#00E5FF"
          : state === "REVIEW" || state === "PROPOSED" ? "#D97706"
          : "#94A3B8";
  return (
    <span className="font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border" style={{ color: c, borderColor: c, background: `${c}18` }}>
      {state.replace("_", " ")}
    </span>
  );
}

export default function Operations() {
  const { missions, tasks, jobs, proposals, verifications, selection, select, refresh } = useCell();
  const [tab, setTab] = useState("jobs");
  const activeMission = missions.find((m) => selection?.kind === "mission" && m.id === selection.id) || missions[0];
  const missionTasks  = tasks.filter((t) => t.mission_id === activeMission?.id || t.missionId === activeMission?.id);

  const advanceJob   = async (id) => { try { await cellApi.advanceJob(id); toast("Job advanced"); await refresh(); } catch (e) { toast(e?.response?.data?.detail || "Advance failed"); } };
  const failJob      = async (id) => { try { await cellApi.failJob(id, "operator marked failed"); toast("Job marked failed"); await refresh(); } catch { toast("Fail failed"); } };
  const advanceMission = async (id) => { try { await cellApi.advanceMission(id); toast("Phase advanced"); await refresh(); } catch { toast("Failed"); } };

  const jobsByState = useMemo(() => {
    const s = { active: [], done: [], failed: [] };
    for (const j of jobs) {
      if (j.state === "VERIFIED")     s.done.push(j);
      else if (JOB_FAILURE[j.state])  s.failed.push(j);
      else                             s.active.push(j);
    }
    return s;
  }, [jobs]);

  return (
    <div className="space-y-4" data-testid="operations">
      {/* Tabs */}
      <div className="border border-[#27272A] bg-[#0B0D10] flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            data-testid={`work-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-4 h-9 font-display text-[11px] uppercase tracking-[0.2em] border-r border-[#27272A] ${
              tab === t.id ? "text-[#00E5FF] border-b-2 border-b-[#00E5FF] bg-[#0F1115]" : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center px-3 font-data text-[10px] uppercase tracking-widest text-[#52525B]">
          {jobs.length} jobs · {proposals.length} proposals · {verifications.length} verifications
        </div>
      </div>

      {tab === "jobs" && (
        <>
          <Panel title="Active jobs" right={<span>{jobsByState.active.length} live</span>}>
            {jobsByState.active.length === 0 ? (
              <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#52525B]">No active jobs</div>
            ) : (
              <ul className="divide-y divide-[#27272A]">
                {jobsByState.active.map((j) => (
                  <li key={j.id} className="px-4 py-3" data-testid={`job-row-${j.id}`}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display text-[13px] text-[#F8FAFC] w-56 truncate">{j.title}</span>
                      <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">→ {j.worker}</span>
                      <StateChip state={j.state} />
                      <span className={`font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
                        j.risk === "HIGH"   ? "border-[#E11D48] text-[#FB7185]" :
                        j.risk === "MEDIUM" ? "border-[#D97706] text-[#F59E0B]" :
                                              "border-[#27272A] text-[#94A3B8]"
                      }`}>RISK {j.risk}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <button data-testid={`job-advance-${j.id}`} onClick={() => advanceJob(j.id)}
                                className="flex items-center gap-1 px-2 py-1 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF18] font-data text-[10px] uppercase tracking-widest">
                          <Play size={11} /> Advance
                        </button>
                        <button data-testid={`job-fail-${j.id}`} onClick={() => failJob(j.id)}
                                className="flex items-center gap-1 px-2 py-1 border border-[#DC2626] text-[#DC2626] hover:bg-[#DC262618] font-data text-[10px] uppercase tracking-widest">
                          <XCircle size={11} /> Fail
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <BuildLifecycleBar state={j.state} testId={`job-lifecycle-${j.id}`} />
                    </div>
                    <div className="mt-2 grid grid-cols-[80px_1fr] gap-2 font-data text-[10px] text-[#52525B] uppercase tracking-widest">
                      <span>PROGRESS</span>
                      <div className="h-1 bg-[#0B0D10] border border-[#27272A]">
                        <div className="h-full bg-[#00E5FF]" style={{ width: `${j.progress ?? 0}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {jobsByState.failed.length > 0 && (
            <Panel title="Failed jobs" right={<span className="text-[#FB7185]">{jobsByState.failed.length}</span>}>
              <ul className="divide-y divide-[#27272A]">
                {jobsByState.failed.map((j) => (
                  <li key={j.id} className="px-4 py-3" data-testid={`job-failed-${j.id}`}>
                    <div className="flex items-center gap-3">
                      <CircleAlert size={13} className="text-[#E11D48]" />
                      <span className="font-display text-[13px] text-[#F8FAFC] flex-1">{j.title}</span>
                      <StateChip state={j.state} />
                    </div>
                    {j.error && <div className="mt-2 pl-6 font-body text-[12px] text-[#FB7185]">{j.error}</div>}
                    <div className="mt-2 pl-6"><BuildLifecycleBar state={j.state} /></div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Completed" right={<span className="text-[#10B981]">{jobsByState.done.length} verified</span>}>
            {jobsByState.done.length === 0 ? (
              <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#52525B]">Nothing verified yet</div>
            ) : (
              <ul className="divide-y divide-[#27272A]">
                {jobsByState.done.map((j) => (
                  <li key={j.id} className="px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 size={13} className="text-[#10B981]" />
                    <span className="font-display text-[13px] text-[#F8FAFC] flex-1">{j.title}</span>
                    <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">→ {j.worker}</span>
                    <StateChip state={j.state} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}

      {tab === "builds" && (
        <Panel title="Governed builds — proposals" right={<span>DISCOVERED → PROPOSED → REVIEW → APPROVED → BUILDING → TESTING → VERIFIED</span>}>
          <ul className="divide-y divide-[#27272A]">
            {proposals.map((p) => (
              <li key={p.id} className="px-4 py-3" data-testid={`proposal-row-${p.id}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-display text-[13px] text-[#F8FAFC] w-64 truncate">{p.rationale}</span>
                  <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">→ {p.worker}</span>
                  <StateChip state={p.state} />
                  <span className={`font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
                    p.risk === "HIGH" ? "border-[#E11D48] text-[#FB7185]" :
                    p.risk === "MEDIUM" ? "border-[#D97706] text-[#F59E0B]" :
                                          "border-[#27272A] text-[#94A3B8]"
                  }`}>RISK {p.risk}</span>
                  <span className="font-data text-[10px] text-[#52525B] uppercase tracking-widest ml-auto">{p.files_touched} file(s)</span>
                </div>
                <div className="mt-2">
                  <BuildLifecycleBar state={p.state === "REJECTED" ? "REJECTED" : p.state} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(p.acceptance || []).map((a, i) => (
                    <span key={i} className="font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border border-[#27272A] text-[#94A3B8]">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "loop" && (
        <Panel title="Mission loop" right={<span>observe → locate → update map</span>}>
          <ul className="divide-y divide-[#27272A]">
            {missions.map((m) => (
              <li key={m.id} onClick={() => select("mission", m.id)}
                  className={`px-4 py-3 cursor-pointer ${activeMission?.id === m.id ? "bg-[#16191E]" : "hover:bg-[#16191E]"}`}
                  data-testid={`mission-row-${m.id}`}>
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
                  <button data-testid={`advance-mission-${m.id}`}
                          onClick={(e) => { e.stopPropagation(); advanceMission(m.id); }}
                          className="flex items-center gap-1 px-2 py-0.5 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF18] font-data text-[10px] uppercase tracking-widest">
                    Advance <ChevronRight size={11} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {activeMission && missionTasks.length > 0 && (
            <div className="border-t border-[#27272A]">
              <div className="px-4 py-2 bg-[#0B0D10] font-data text-[10px] uppercase tracking-widest text-[#52525B]">
                Tasks · {activeMission.codename}
              </div>
              <ul>
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
            </div>
          )}
        </Panel>
      )}

      {tab === "verify" && (
        <Panel title="Verification record" right={<span>{verifications.length} entries</span>}>
          {verifications.length === 0 ? (
            <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#52525B]">No verifications yet</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {verifications.map((v) => (
                <li key={v.id} className="px-4 py-3" data-testid={`ver-row-${v.id}`}>
                  <div className="flex items-center gap-3">
                    {v.state === "PASSED" ? <CheckCircle2 size={13} className="text-[#10B981]" /> : <CircleAlert size={13} className="text-[#E11D48]" />}
                    <span className="font-display text-[12px] text-[#F8FAFC] flex-1">
                      {v.target_kind}:{v.target_id}
                    </span>
                    <span className="font-data text-[10px] uppercase tracking-widest text-[#52525B]">{v.ts}</span>
                    <StateChip state={v.state} />
                  </div>
                  <div className="mt-2 pl-6 font-body text-[12px] text-[#94A3B8]">{v.evidence}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
