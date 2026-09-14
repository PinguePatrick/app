// The rebuilt Home. Answers the 10 §87 questions in one screen.
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import MetricTile from "@/components/MetricTile";
import DataStatePill from "@/components/DataStatePill";
import GovernanceBadge from "@/components/GovernanceBadge";
import FatherAlerts from "@/components/FatherAlerts";
import AutonomyPanel from "@/components/AutonomyPanel";
import JrCellStatus from "@/components/JrCellStatus";
import NextFocus from "@/components/NextFocus";
import { AlertOctagon, ArrowUpRight, Radio, Package } from "lucide-react";

export default function CommandCenter() {
  const { mission, systems, missions, approvals, risks, events, agents, artifacts, select } = useCell();
  const navigate = useNavigate();

  const truthCounts = systems.reduce((acc, s) => { acc[s.truth] = (acc[s.truth] || 0) + 1; return acc; }, {});
  const activeMissions   = missions.filter((m) => m.status === "ACTIVE");
  const pendingApprovals = approvals.filter((a) => a.state === "PENDING");
  const activeWorkers    = agents.filter((a) => a.posture === "EXECUTING" || a.posture === "OBSERVING" || a.posture === "SIMULATING");
  const problems         = risks.filter((r) => r.level === "HIGH" || r.level === "MEDIUM");

  return (
    <div className="space-y-4" data-testid="command-center">
      {/* Hero */}
      <div className="border border-[#27272A] bg-[#0F1115] grid-bg grain relative">
        <div className="p-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="font-data text-[10px] uppercase tracking-[0.3em] text-[#00E5FF]">JRCOCKPIT // COMMAND CENTER</div>
            <h1 className="font-display text-4xl md:text-5xl text-[#F8FAFC] mt-2">
              THE MAP <span className="text-[#00E5FF]">IS</span> THE TRUTH.
            </h1>
            <p className="mt-2 text-[13px] text-[#94A3B8] font-body max-w-2xl leading-relaxed">
              JR operates through CELL. CELL operates the L@B. Every privileged action passes through
              <span className="text-[#00E5FF]"> Father approval</span> and lands on the map.
            </p>
          </div>
          <div className="flex items-center gap-6 font-data">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#52525B]">Mission phase</span>
              <span className="text-[#F8FAFC] text-lg">{mission?.phase || "…"}</span>
            </div>
            <div className="h-10 w-px bg-[#27272A]" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#52525B]">Uptime</span>
              <span className="text-[#F8FAFC] text-lg">11d 09h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 0 — What needs Father? (top priority) */}
      <FatherAlerts />

      {/* Row 1 — What is Jr doing? What is CELL doing? */}
      <JrCellStatus />

      {/* Row 2 — Autonomy scope */}
      <AutonomyPanel />

      {/* Row 3 — Metrics summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricTile testId="metric-systems"     accent label="Systems on map"     value={systems.length}                  unit="nodes"    hint={`${truthCounts.KNOWN ?? 0} known · ${truthCounts.UNKNOWN ?? 0} unknown`} />
        <MetricTile testId="metric-active"      label="Active missions"           value={activeMissions.length}           unit="live"     hint="Executing on L@B" />
        <MetricTile testId="metric-approvals"   label="Approvals pending"         value={pendingApprovals.length}         unit="queue"    hint="Await Father (JR)" />
        <MetricTile testId="metric-workers"     label="Active workers"            value={activeWorkers.length}            unit="agents"   hint="EXECUTING / OBSERVING / SIM" />
        <MetricTile testId="metric-conflicting" label="Conflicting sources"       value={truthCounts.CONFLICTING ?? 0}    unit="src"      hint="Truth ambiguity" />
        <MetricTile testId="metric-simulated"   label="Simulations running"       value={truthCounts.SIMULATED ?? 0}      unit="sandbox"  hint="Non-authoritative" />
      </div>

      {/* Row 4 — What jobs are running? + What does Jr want next? */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel testId="panel-missions" title="Active operations" right={<span>{missions.length} total</span>} className="lg:col-span-2">
          <ul className="divide-y divide-[#27272A]">
            {missions.map((m) => (
              <li key={m.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[#16191E] cursor-pointer"
                  onClick={() => { select("mission", m.id); navigate("/operations"); }}>
                <div className="w-1.5 h-8 bg-[#00E5FF]" style={{ opacity: m.status === "ACTIVE" ? 1 : 0.35 }} />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[13px] text-[#F8FAFC] truncate">{m.codename}</div>
                  <div className="font-body text-[12px] text-[#94A3B8] truncate">{m.objective}</div>
                </div>
                <DataStatePill state={m.truth} />
                <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8] hidden md:block">{m.phase}</span>
                <span className={`font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                  m.status === "ACTIVE"     ? "border-[#10B981] text-[#10B981]" :
                  m.status === "BLOCKED"    ? "border-[#DC2626] text-[#DC2626]" :
                  m.status === "SIMULATION" ? "border-[#14B8A6] text-[#14B8A6]" :
                                              "border-[#D97706] text-[#F59E0B]"
                }`}>{m.status}</span>
                <ArrowUpRight size={13} className="text-[#3F3F46]" />
              </li>
            ))}
          </ul>
        </Panel>

        <NextFocus />
      </div>

      {/* Row 5 — L@B health + Problems + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel testId="panel-truth" title="L@B truth breakdown" right={<span>from the map</span>}>
          <div className="p-4 space-y-3">
            {["KNOWN", "STALE", "CONFLICTING", "SIMULATED", "UNKNOWN"].map((k) => (
              <div key={k} className="flex items-center gap-3">
                <DataStatePill state={k} />
                <div className="flex-1 h-1.5 bg-[#0B0D10] border border-[#27272A]">
                  <div className="h-full" style={{
                    width: `${((truthCounts[k] || 0) / Math.max(systems.length, 1)) * 100}%`,
                    background: { KNOWN: "#F8FAFC", STALE: "#D97706", CONFLICTING: "#E11D48", SIMULATED: "#14B8A6", UNKNOWN: "#71717A" }[k],
                  }} />
                </div>
                <span className="font-data text-[11px] text-[#F8FAFC] w-6 text-right">{truthCounts[k] || 0}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel testId="panel-problems" title="Problems" right={<span>{problems.length} open</span>}>
          {problems.length === 0 ? (
            <div className="p-4 font-data text-[11px] uppercase tracking-widest text-[#10B981]">No open problems</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {problems.map((r) => (
                <li key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <AlertOctagon size={13} className={r.level === "HIGH" ? "text-[#E11D48]" : "text-[#D97706]"} />
                  <span className="flex-1 font-body text-[12px] text-[#F8FAFC]">{r.label}</span>
                  <span className={`font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
                    r.level === "HIGH" ? "border-[#E11D48] text-[#FB7185]" : "border-[#D97706] text-[#F59E0B]"
                  }`}>{r.level}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel testId="panel-events" title="Recent activity" right={<span className="flex items-center gap-1.5"><Radio size={11} className="text-[#00E5FF] blink" /> live</span>}>
          <ul className="divide-y divide-[#27272A] max-h-[300px] overflow-y-auto scanlines">
            {events.slice(-10).reverse().map((e) => (
              <li key={e.id} className="px-4 py-2 grid grid-cols-[70px_100px_1fr] gap-2 items-center font-data text-[11px]">
                <span className="text-[#52525B]">{e.ts}</span>
                <span className="text-[#00E5FF] uppercase tracking-widest">{e.kind}</span>
                <span className="text-[#F8FAFC] truncate">{e.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Row 5.5 — Latest artifacts (§10 provenance-first) */}
      {artifacts.length > 0 && (
        <Panel testId="panel-latest-artifacts" title="Latest artifacts"
               right={<span className="flex items-center gap-1.5"><Package size={11} className="text-[#00E5FF]" /> {artifacts.length} total · click to inspect in Operations → Observe</span>}>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#27272A]">
            {artifacts.slice(0, 3).map((a) => (
              <div key={a.id} data-testid={`home-artifact-${a.id}`}
                   onClick={() => navigate("/operations")}
                   className="p-4 hover:bg-[#16191E] cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={12} className="text-[#00E5FF]" />
                  <span className="font-display text-[12px] text-[#F8FAFC]">{a.id}</span>
                  <span className="font-data text-[10px] uppercase tracking-widest text-[#52525B]">{a.class}</span>
                  <span className="ml-auto"><DataStatePill state={a.truth === "PROPOSED" ? "SIMULATED" : a.truth === "DOWN" ? "UNKNOWN" : a.truth === "VERIFIED" ? "KNOWN" : a.truth === "SIMULATED" ? "SIMULATED" : "UNKNOWN"} /></span>
                </div>
                <div className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">
                  by {a.producer} · job {a.job_id || "—"}
                </div>
                <div className="mt-1 font-data text-[10px] uppercase tracking-widest text-[#52525B]">
                  {a.verified ? "VERIFIED" : "UNVERIFIED"} · {a.created || "—"}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Row 6 — Pending approvals table (Governance shortcut) */}
      <Panel testId="panel-approvals" title="Approval queue" right={<span>{approvals.length} items · one click to Governance</span>}>
        {approvals.length === 0 ? (
          <div className="p-4 text-[#52525B] font-data text-[11px] uppercase tracking-widest">Queue empty</div>
        ) : (
          <ul className="divide-y divide-[#27272A]">
            {approvals.map((a) => (
              <li key={a.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[#16191E] cursor-pointer"
                  onClick={() => { select("approval", a.id); navigate("/governance"); }}>
                <span className="font-display text-[12px] text-[#F8FAFC] flex-1 truncate">{a.title}</span>
                <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">by {a.requester}</span>
                <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8]">{a.policy}</span>
                <span className={`font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
                  a.risk === "HIGH"   ? "border-[#E11D48] text-[#FB7185]" :
                  a.risk === "MEDIUM" ? "border-[#D97706] text-[#F59E0B]" :
                                        "border-[#27272A] text-[#94A3B8]"
                }`}>RISK {a.risk}</span>
                <GovernanceBadge state={a.state} />
                <ArrowUpRight size={12} className="text-[#3F3F46]" />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
