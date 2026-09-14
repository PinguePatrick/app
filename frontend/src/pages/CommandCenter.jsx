import React from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import MetricTile from "@/components/MetricTile";
import DataStatePill from "@/components/DataStatePill";
import GovernanceBadge from "@/components/GovernanceBadge";
import { AlertOctagon, ArrowUpRight, Radio, ShieldAlert, Terminal, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CommandCenter() {
  const { systems, missions, approvals, risks, events, select } = useCell();
  const navigate = useNavigate();

  const truthCounts = systems.reduce((acc, s) => { acc[s.truth] = (acc[s.truth] || 0) + 1; return acc; }, {});
  const activeMissions = missions.filter((m) => m.status === "ACTIVE").length;
  const pendingApprovals = approvals.filter((a) => a.state === "PENDING").length;

  return (
    <div className="space-y-4" data-testid="command-center">
      {/* Hero header */}
      <div className="border border-[#27272A] bg-[#0F1115] grid-bg grain relative">
        <div className="p-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="font-data text-[10px] uppercase tracking-[0.3em] text-[#00E5FF]">CELL // COMMAND CENTER</div>
            <h1 className="font-display text-4xl md:text-5xl text-[#F8FAFC] mt-2">
              THE MAP <span className="text-[#00E5FF]">IS</span> THE TRUTH.
            </h1>
            <p className="mt-2 text-[13px] text-[#94A3B8] font-body max-w-2xl leading-relaxed">
              JR operates through CELL. CELL operates L@B. Observe, locate truth, understand, plan, check governance,
              approve, execute, verify, record, update the map.
            </p>
          </div>
          <div className="flex items-center gap-6 font-data">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#52525B]">Cycle</span>
              <span className="text-[#F8FAFC] text-lg">OBSERVE → LOCATE → PLAN</span>
            </div>
            <div className="h-10 w-px bg-[#27272A]" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#52525B]">Uptime</span>
              <span className="text-[#F8FAFC] text-lg">11d 09h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricTile testId="metric-systems" accent label="Systems on map" value={systems.length} unit="nodes" hint={`${truthCounts.KNOWN ?? 0} known · ${truthCounts.UNKNOWN ?? 0} unknown`} />
        <MetricTile testId="metric-active" label="Active missions" value={activeMissions} unit="live" hint="Executing on L@B" />
        <MetricTile testId="metric-approvals" label="Approvals pending" value={pendingApprovals} unit="queue" hint="Await operator JR" />
        <MetricTile testId="metric-conflicting" label="Conflicting sources" value={truthCounts.CONFLICTING ?? 0} unit="src" hint="Truth ambiguity" />
        <MetricTile testId="metric-stale" label="Stale nodes" value={truthCounts.STALE ?? 0} unit="nodes" hint="Sync required" />
        <MetricTile testId="metric-simulated" label="Simulations running" value={truthCounts.SIMULATED ?? 0} unit="sandbox" hint="Non-authoritative" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Missions */}
        <Panel testId="panel-missions" title="Active operations" right={<span>{missions.length} total</span>} className="lg:col-span-2">
          <ul className="divide-y divide-[#27272A]">
            {missions.map((m) => (
              <li key={m.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[#16191E] cursor-pointer" onClick={() => { select("mission", m.id); navigate("/operations"); }}>
                <div className="w-1.5 h-8 bg-[#00E5FF]" style={{ opacity: m.status === "ACTIVE" ? 1 : 0.35 }} />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[13px] text-[#F8FAFC] truncate">{m.codename}</div>
                  <div className="font-body text-[12px] text-[#94A3B8] truncate">{m.objective}</div>
                </div>
                <DataStatePill state={m.truth} />
                <span className="font-data text-[10px] uppercase tracking-widest text-[#94A3B8] hidden md:block">{m.phase}</span>
                <span className={`font-data text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                  m.status === "ACTIVE" ? "border-[#10B981] text-[#10B981]" :
                  m.status === "BLOCKED" ? "border-[#DC2626] text-[#DC2626]" :
                  m.status === "SIMULATION" ? "border-[#14B8A6] text-[#14B8A6]" :
                  "border-[#D97706] text-[#F59E0B]"
                }`}>{m.status}</span>
                <ArrowUpRight size={13} className="text-[#3F3F46]" />
              </li>
            ))}
          </ul>
        </Panel>

        {/* Approval queue */}
        <Panel testId="panel-approvals" title="Approval queue" right={<span>{approvals.length} items</span>}>
          {approvals.length === 0 ? (
            <div className="p-4 text-[#52525B] font-data text-[11px] uppercase tracking-widest">Queue empty</div>
          ) : (
            <ul className="divide-y divide-[#27272A]">
              {approvals.map((a) => (
                <li key={a.id} className="px-4 py-3 hover:bg-[#16191E] cursor-pointer" onClick={() => { select("approval", a.id); navigate("/governance"); }}>
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={13} className="text-[#00E5FF] mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[12px] text-[#F8FAFC] truncate">{a.title}</div>
                      <div className="font-data text-[10px] text-[#52525B] uppercase tracking-widest mt-0.5">
                        {a.policy} · risk {a.risk}
                      </div>
                    </div>
                    <GovernanceBadge state={a.state} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Truth breakdown */}
        <Panel testId="panel-truth" title="Truth breakdown" right={<span>from the map</span>}>
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

        {/* Risks */}
        <Panel testId="panel-risks" title="Open risks">
          <ul className="divide-y divide-[#27272A]">
            {risks.map((r) => (
              <li key={r.id} className="px-4 py-3 flex items-center gap-3">
                <AlertOctagon size={13} className={
                  r.level === "HIGH" ? "text-[#E11D48]" :
                  r.level === "MEDIUM" ? "text-[#D97706]" : "text-[#71717A]"
                } />
                <span className="flex-1 font-body text-[12px] text-[#F8FAFC]">{r.label}</span>
                <span className={`font-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 border ${
                  r.level === "HIGH" ? "border-[#E11D48] text-[#FB7185]" :
                  r.level === "MEDIUM" ? "border-[#D97706] text-[#F59E0B]" : "border-[#71717A] text-[#A1A1AA]"
                }`}>{r.level}</span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Events stream */}
        <Panel testId="panel-events" title="Event stream" right={<span className="flex items-center gap-1.5"><Radio size={11} className="text-[#00E5FF] blink" /> live · demo</span>}>
          <ul className="divide-y divide-[#27272A] max-h-[240px] overflow-y-auto scanlines">
            {events.map((e) => (
              <li key={e.id} className="px-4 py-2 grid grid-cols-[70px_90px_1fr] gap-2 items-center font-data text-[11px]">
                <span className="text-[#52525B]">{e.ts}</span>
                <span className="text-[#00E5FF] uppercase tracking-widest">{e.kind}</span>
                <span className="text-[#F8FAFC] truncate">{e.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Operational loop */}
      <Panel testId="panel-loop" title="Operational loop" right={<span><Zap size={11} className="inline mr-1 text-[#00E5FF]" /> CELL executes this cycle</span>}>
        <div className="p-4 flex flex-wrap gap-2 items-center">
          {["OBSERVE","LOCATE TRUTH","UNDERSTAND","PLAN","GOVERNANCE","APPROVE","EXECUTE","VERIFY","RECORD","UPDATE MAP"].map((step, i) => (
            <React.Fragment key={step}>
              <span className={`font-data text-[11px] uppercase tracking-widest px-2 py-1 border ${i === 0 ? "border-[#00E5FF] text-[#00E5FF]" : "border-[#27272A] text-[#94A3B8]"}`}>
                {String(i + 1).padStart(2, "0")} {step}
              </span>
              {i < 9 && <Terminal size={10} className="text-[#3F3F46]" />}
            </React.Fragment>
          ))}
        </div>
      </Panel>
    </div>
  );
}
