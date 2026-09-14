// System surface — Services / Runtime / Machine / Routes / Diagnostics.
// Nav name stays "RUNTIME" per user preference. Uses full §24 truth model — no fake green.
import React, { useState } from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import DataStatePill from "@/components/DataStatePill";
import ServiceTruthPill from "@/components/ServiceTruthPill";
import { Server, Cpu, HardDrive, Route as RouteIcon, ActivitySquare } from "lucide-react";

const TABS = [
  { id: "services",    label: "Services",    icon: Server },
  { id: "runtime",     label: "Runtime",     icon: Cpu },
  { id: "machine",     label: "Machine",     icon: HardDrive },
  { id: "routes",      label: "Routes",      icon: RouteIcon },
  { id: "diagnostics", label: "Diagnostics", icon: ActivitySquare },
];

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

export default function Runtime() {
  const { services, runtime, routes, diagnostics, select } = useCell();
  const [tab, setTab] = useState("services");

  return (
    <div className="space-y-4" data-testid="runtime">
      <div className="border border-[#27272A] bg-[#0B0D10] flex flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            data-testid={`system-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-4 h-9 flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.2em] border-r border-[#27272A] ${
              tab === t.id ? "text-[#00E5FF] border-b-2 border-b-[#00E5FF] bg-[#0F1115]" : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "services" && (
        <Panel title="Services" right={<span>{services.length} services · truth per §24 (no fake green)</span>}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] font-data">
              <thead className="bg-[#0B0D10] text-[#52525B] uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Service</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Kind</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Host:Port</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Truth</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Gov</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Last check</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Deps → Consumers</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} data-testid={`svc-row-${s.id}`} className="hover:bg-[#16191E]">
                    <td className="px-4 py-2 border-b border-[#27272A] text-[#F8FAFC]">{s.name}</td>
                    <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{s.kind}</td>
                    <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{s.host}:{s.port}</td>
                    <td className="px-4 py-2 border-b border-[#27272A]"><ServiceTruthPill state={s.status} /></td>
                    <td className="px-4 py-2 border-b border-[#27272A]"><GovClass value={s.gov_class} /></td>
                    <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{s.last_check}</td>
                    <td className="px-4 py-2 border-b border-[#27272A] text-[#52525B] text-[11px]">
                      {(s.deps || []).length}→{(s.consumers || []).length}
                      {s.error && <span className="ml-2 text-[#FB7185]">· {s.error}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "runtime" && (
        <Panel title="Runtime hosts" right={<span>{runtime.length} hosts · mocked telemetry labeled SIMULATED</span>}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] font-data">
              <thead className="bg-[#0B0D10] text-[#52525B] uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Host</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Image</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">State</th>
                  <th className="text-right px-4 py-2 border-b border-[#27272A]">CPU</th>
                  <th className="text-right px-4 py-2 border-b border-[#27272A]">MEM</th>
                  <th className="text-left px-4 py-2 border-b border-[#27272A]">Truth</th>
                </tr>
              </thead>
              <tbody>
                {runtime.map((r) => (
                  <tr key={r.id} data-testid={`runtime-row-${r.id}`} className="hover:bg-[#16191E]">
                    <td className="px-4 py-2 border-b border-[#27272A] text-[#F8FAFC]">{r.name}</td>
                    <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{r.image}</td>
                    <td className="px-4 py-2 border-b border-[#27272A]">
                      <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-widest ${
                        r.state === "RUNNING" ? "border-[#10B981] text-[#10B981]" :
                        r.state === "IDLE" ? "border-[#27272A] text-[#94A3B8]" :
                        r.state === "SIMULATED" ? "border-[#14B8A6] text-[#14B8A6]" :
                        "border-[#DC2626] text-[#DC2626]"
                      }`}>{r.state}</span>
                    </td>
                    <td className="px-4 py-2 border-b border-[#27272A] text-right text-[#F8FAFC]">{r.cpu}</td>
                    <td className="px-4 py-2 border-b border-[#27272A] text-right text-[#F8FAFC]">{r.mem}</td>
                    <td className="px-4 py-2 border-b border-[#27272A]"><DataStatePill state={r.truth} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "machine" && (
        <Panel title="Machine" right={<span className="text-[#14B8A6]">not connected — telemetry SIMULATED</span>}>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "CPU",     value: "—", hint: "no host adapter" },
              { label: "RAM",     value: "—", hint: "no host adapter" },
              { label: "GPU",     value: "—", hint: "no host adapter" },
              { label: "VRAM",    value: "—", hint: "no host adapter" },
              { label: "STORAGE", value: "—", hint: "no host adapter" },
              { label: "RUNTIME", value: "—", hint: "no host adapter" },
              { label: "PROCESSES", value: "—", hint: "no host adapter" },
              { label: "MODE",    value: "SIMULATED", hint: "—" },
            ].map((t) => (
              <div key={t.label} className="border border-[#27272A] bg-[#0B0D10] p-3">
                <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B]">{t.label}</div>
                <div className="mt-2 font-data text-2xl text-[#F8FAFC]">{t.value}</div>
                <div className="mt-1 font-data text-[10px] text-[#52525B] uppercase tracking-widest">{t.hint}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#27272A] px-4 py-3 font-body text-[12px] text-[#94A3B8]">
            §32 honesty rule: no CPU/GPU numbers are fabricated. When a host adapter is added, values will come from it.
          </div>
        </Panel>
      )}

      {tab === "routes" && (
        <Panel title="Routes registry" right={<span>{routes.length} endpoints · action-risk classification per §42</span>}>
          <table className="w-full text-[12px] font-data">
            <thead className="bg-[#0B0D10] text-[#52525B] uppercase tracking-widest text-[10px]">
              <tr>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Method</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Path</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Handler</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Governance class</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} data-testid={`route-row-${r.id}`} className="hover:bg-[#16191E]">
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#00E5FF]">{r.method}</td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#F8FAFC]">{r.path}</td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{r.handler}</td>
                  <td className="px-4 py-2 border-b border-[#27272A]"><GovClass value={r.gov_class} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {tab === "diagnostics" && (
        <Panel title="Diagnostics" right={<span>{diagnostics.length} checks · never claim green without evidence</span>}>
          <ul className="divide-y divide-[#27272A]">
            {diagnostics.map((d) => (
              <li key={d.id} className="px-4 py-2 grid grid-cols-[16px_1fr_100px_140px] items-center gap-3 font-data text-[12px]"
                  data-testid={`diag-row-${d.id}`}>
                <span className={`h-2 w-2 inline-block ${d.status === "PASS" ? "bg-[#10B981]" : d.status === "DOWN" ? "bg-[#DC2626]" : "bg-[#D97706]"}`} />
                <span className="text-[#F8FAFC]">{d.name}</span>
                <span className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 border justify-self-start ${
                  d.status === "PASS" ? "border-[#10B981] text-[#10B981]" :
                  d.status === "DOWN" ? "border-[#DC2626] text-[#FB7185]" :
                                        "border-[#D97706] text-[#F59E0B]"
                }`}>{d.status}</span>
                <span className="text-[#94A3B8] text-[11px]">{d.note}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
