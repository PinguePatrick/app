import React, { useMemo, useState } from "react";
import { useCell } from "@/state/CellContext";
import Panel from "@/components/Panel";
import DataStatePill from "@/components/DataStatePill";

const STATE_COLOR = {
  KNOWN: "#F8FAFC",
  UNKNOWN: "#71717A",
  STALE: "#D97706",
  CONFLICTING: "#E11D48",
  SIMULATED: "#14B8A6",
};

const nodeDash = (t) => ({
  KNOWN: "0",
  UNKNOWN: "4 4",
  STALE: "2 3",
  CONFLICTING: "0",
  SIMULATED: "6 4",
}[t]);

const nodeStroke = (t) => (t === "CONFLICTING" ? 3 : 1.5);

export default function MasterMap() {
  const { map, systems, select, selection } = useCell();
  const [filter, setFilter] = useState("ALL");

  const nodes = useMemo(() => {
    if (filter === "ALL") return map.nodes;
    return map.nodes.map((n) => ({ ...n, dim: n.truth !== filter }));
  }, [map.nodes, filter]);

  const nodeById = (id) => map.nodes.find((n) => n.id === id);

  return (
    <div className="space-y-4" data-testid="master-map">
      <Panel
        title="Master L@B Map — source-of-truth interface"
        right={
          <div className="flex items-center gap-1">
            {["ALL","KNOWN","STALE","CONFLICTING","SIMULATED","UNKNOWN"].map((f) => (
              <button
                key={f}
                data-testid={`map-filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 text-[10px] font-data uppercase tracking-widest border ${
                  filter === f ? "border-[#00E5FF] text-[#00E5FF]" : "border-[#27272A] text-[#94A3B8] hover:border-[#3F3F46]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        <div className="relative">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <svg
            data-testid="map-canvas"
            viewBox="0 0 1000 600"
            className="w-full h-[520px] relative"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* edges */}
            <g>
              {map.edges.map((e, i) => {
                const a = nodeById(e.from); const b = nodeById(e.to);
                if (!a || !b) return null;
                const color = STATE_COLOR[e.truth];
                const dashed = e.truth === "UNKNOWN" || e.truth === "SIMULATED" || e.truth === "STALE";
                return (
                  <line
                    key={i}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={color}
                    strokeOpacity={0.55}
                    strokeWidth={e.truth === "CONFLICTING" ? 2 : 1}
                    strokeDasharray={dashed ? "6 6" : "0"}
                    className={e.truth === "SIMULATED" ? "march" : ""}
                  />
                );
              })}
            </g>
            {/* nodes */}
            <g>
              {nodes.map((n) => {
                const active = selection?.kind === "system" && selection?.id === n.id;
                const isCell = n.id === "cell-core";
                const color = isCell ? "#00E5FF" : STATE_COLOR[n.truth];
                return (
                  <g
                    key={n.id}
                    onClick={() => !isCell && select("system", n.id)}
                    style={{ cursor: isCell ? "default" : "pointer", opacity: n.dim ? 0.22 : 1 }}
                    className={n.truth === "SIMULATED" ? "pulse-sim" : ""}
                    data-testid={`map-node-${n.id}`}
                  >
                    {active && <circle cx={n.x} cy={n.y} r={n.r + 10} fill="none" stroke="#00E5FF" strokeOpacity={0.4} strokeDasharray="2 3" />}
                    <circle
                      cx={n.x} cy={n.y} r={n.r}
                      fill={isCell ? "rgba(0,229,255,0.14)" : "#0F1115"}
                      stroke={color}
                      strokeWidth={isCell ? 2 : nodeStroke(n.truth)}
                      strokeDasharray={isCell ? "0" : nodeDash(n.truth)}
                    />
                    {isCell && <circle cx={n.x} cy={n.y} r={6} fill="#00E5FF" />}
                    <text
                      x={n.x} y={n.y + n.r + 16}
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontFamily="IBM Plex Mono"
                      fontSize="11"
                      letterSpacing="1"
                    >
                      {n.label}
                    </text>
                    <text
                      x={n.x} y={n.y + n.r + 30}
                      textAnchor="middle"
                      fill={color}
                      fontFamily="JetBrains Mono"
                      fontSize="9"
                      letterSpacing="1.5"
                    >
                      {n.truth}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute top-3 left-3 border border-[#27272A] bg-[#0B0D10]/90 backdrop-blur-sm p-3 space-y-1.5">
            <div className="font-data text-[9px] uppercase tracking-widest text-[#52525B] mb-1">Legend</div>
            {["KNOWN","UNKNOWN","STALE","CONFLICTING","SIMULATED"].map((k) => (
              <div key={k} className="flex items-center gap-2">
                <DataStatePill state={k} size="xs" />
              </div>
            ))}
          </div>

          <div className="absolute bottom-3 right-3 border border-[#27272A] bg-[#0B0D10]/90 backdrop-blur-sm px-3 py-2">
            <div className="font-data text-[10px] uppercase tracking-[0.2em] text-[#00E5FF]">THE MAP IS THE TRUTH</div>
            <div className="font-data text-[9px] uppercase tracking-widest text-[#52525B] mt-0.5">click a node to inspect</div>
          </div>
        </div>
      </Panel>

      {/* Node table mirror */}
      <Panel title="Systems index" right={<span>{systems.length} nodes</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] font-data">
            <thead className="bg-[#0B0D10] text-[#52525B] uppercase tracking-widest text-[10px]">
              <tr>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Node</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Kind</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Owner team</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Truth</th>
                <th className="text-left px-4 py-2 border-b border-[#27272A]">Note</th>
              </tr>
            </thead>
            <tbody>
              {systems.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => select("system", s.id)}
                  data-testid={`systems-row-${s.id}`}
                  className={`cursor-pointer hover:bg-[#16191E] ${selection?.id === s.id ? "bg-[#16191E]" : ""}`}
                >
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#F8FAFC]">{s.name}</td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{s.kind}</td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{s.owner}</td>
                  <td className="px-4 py-2 border-b border-[#27272A]"><DataStatePill state={s.truth} /></td>
                  <td className="px-4 py-2 border-b border-[#27272A] text-[#94A3B8]">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
