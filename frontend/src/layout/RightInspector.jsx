// Extended Context Inspector (Phase 6): richer facets for system nodes —
// service · repo · dependencies · consumers · last check · related jobs.
import React, { useMemo } from "react";
import { useCell } from "@/state/CellContext";
import DataStatePill from "@/components/DataStatePill";
import GovernanceBadge from "@/components/GovernanceBadge";
import ServiceTruthPill from "@/components/ServiceTruthPill";
import { X, MapPin, GitBranch, Radio, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RightInspector() {
  const { selection, clearSelection, systems, agents, missions, approvals, sources, services, jobs, artifacts, select } = useCell();
  const navigate = useNavigate();

  const details = useMemo(() => {
    if (!selection) return null;
    const { kind, id } = selection;
    if (kind === "system")   return { kind, entity: systems.find((s) => s.id === id) };
    if (kind === "agent")    return { kind, entity: agents.find((a) => a.id === id) };
    if (kind === "mission")  return { kind, entity: missions.find((m) => m.id === id) };
    if (kind === "approval") return { kind, entity: approvals.find((a) => a.id === id) };
    if (kind === "source")   return { kind, entity: sources.find((s) => s.id === id) };
    if (kind === "job")      return { kind, entity: jobs.find((j) => j.id === id) };
    return null;
  }, [selection, systems, agents, missions, approvals, sources, jobs]);

  // Related artifacts (§53) — for a selected Job, Mission, or System
  const relatedArtifacts = useMemo(() => {
    if (!details) return [];
    const { kind, entity } = details;
    if (!entity) return [];
    if (kind === "job")     return artifacts.filter((a) => a.job_id === entity.id);
    if (kind === "mission") return artifacts.filter((a) => a.mission_id === entity.id);
    if (kind === "system")  return artifacts.filter((a) => a.job_id && jobs.some((j) => j.id === a.job_id));
    return [];
  }, [details, artifacts, jobs]);

  // Phase 6 facets for a system node
  const facets = useMemo(() => {
    if (details?.kind !== "system") return null;
    const s = details.entity;
    if (!s) return null;
    const service    = s.service_id ? services.find((x) => x.id === s.service_id) : null;
    const dependsOn  = (s.depends_on || []).map((id) => systems.find((x) => x.id === id)).filter(Boolean);
    const consumers  = systems.filter((x) => (x.depends_on || []).includes(s.id));
    const relatedJobs = jobs.filter((j) => (j.files || []).some((f) => (s.repo && f.startsWith(s.repo.split("/")[1] || "")))
                                          || (s.name && j.title.includes(s.name)));
    return { service, dependsOn, consumers, relatedJobs };
  }, [details, services, systems, jobs]);

  return (
    <aside data-testid="right-inspector" className="w-80 shrink-0 border-l border-[#27272A] bg-[#0B0D10] flex flex-col">
      <header className="h-9 border-b border-[#27272A] px-4 flex items-center justify-between bg-[#0F1115]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#00E5FF]" />
          <span className="font-display text-[11px] tracking-[0.2em] text-[#F8FAFC]">CONTEXT INSPECTOR</span>
        </div>
        {selection && (
          <button data-testid="clear-selection" onClick={clearSelection} className="text-[#52525B] hover:text-[#F8FAFC]">
            <X size={13} />
          </button>
        )}
      </header>

      {!details && (
        <div className="p-4 flex-1 flex flex-col items-start gap-3 text-[#52525B]">
          <MapPin size={20} className="text-[#27272A]" />
          <div className="font-data text-[11px] uppercase tracking-widest">No selection</div>
          <p className="text-[12px] leading-relaxed font-body">
            Select any system, agent, mission, source or approval to inspect it here.
            Everything shown is anchored to the Master L@B Map.
          </p>
          <div className="mt-2 font-data text-[10px] text-[#3F3F46] uppercase tracking-widest">
            THE MAP IS THE TRUTH
          </div>
        </div>
      )}

      {details && details.entity && (
        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B]">{details.kind}</div>
            <div className="font-display text-lg text-[#F8FAFC] mt-1">{details.entity.name || details.entity.codename || details.entity.title || details.entity.label}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {details.entity.truth && <DataStatePill state={details.entity.truth} />}
              {details.entity.state && <GovernanceBadge state={details.entity.state} />}
              {details.entity.trust && <DataStatePill state={details.entity.trust} />}
            </div>
          </div>

          {/* Phase 6 richer facets — only for systems */}
          {facets && (
            <>
              {facets.service && (
                <div className="border-t border-[#27272A] pt-3" data-testid="facet-service">
                  <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2">Service</div>
                  <div className="flex items-center justify-between font-data text-[11px]">
                    <span className="text-[#F8FAFC]">{facets.service.name}</span>
                    <ServiceTruthPill state={facets.service.status} />
                  </div>
                  <div className="mt-1 font-data text-[10px] text-[#52525B] uppercase tracking-widest">
                    {facets.service.host}:{facets.service.port} · last check {facets.service.last_check}
                  </div>
                </div>
              )}

              {details.entity.repo && (
                <div className="border-t border-[#27272A] pt-3" data-testid="facet-repo">
                  <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2 flex items-center gap-1">
                    <GitBranch size={11} /> Repository
                  </div>
                  <div className="font-data text-[12px] text-[#F8FAFC]">{details.entity.repo}</div>
                </div>
              )}

              <div className="border-t border-[#27272A] pt-3 grid grid-cols-2 gap-3" data-testid="facet-deps">
                <div>
                  <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2">Depends on</div>
                  {facets.dependsOn.length === 0 ? (
                    <div className="font-data text-[11px] text-[#52525B]">—</div>
                  ) : (
                    <ul className="space-y-1">
                      {facets.dependsOn.map((d) => (
                        <li key={d.id} onClick={() => select("system", d.id)}
                            className="cursor-pointer font-data text-[11px] text-[#F8FAFC] hover:text-[#00E5FF] flex items-center gap-1">
                          <ArrowRight size={10} /> {d.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2">Consumers</div>
                  {facets.consumers.length === 0 ? (
                    <div className="font-data text-[11px] text-[#52525B]">—</div>
                  ) : (
                    <ul className="space-y-1">
                      {facets.consumers.map((c) => (
                        <li key={c.id} onClick={() => select("system", c.id)}
                            className="cursor-pointer font-data text-[11px] text-[#F8FAFC] hover:text-[#00E5FF] flex items-center gap-1">
                          <ArrowRight size={10} /> {c.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="border-t border-[#27272A] pt-3" data-testid="facet-lastcheck">
                <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2 flex items-center gap-1">
                  <Radio size={11} className="text-[#00E5FF]" /> Last check
                </div>
                <div className="font-data text-[12px] text-[#F8FAFC]">{details.entity.last_check || "—"}</div>
              </div>

              {facets.relatedJobs.length > 0 && (
                <div className="border-t border-[#27272A] pt-3" data-testid="facet-jobs">
                  <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2">Related jobs</div>
                  <ul className="space-y-1">
                    {facets.relatedJobs.map((j) => (
                      <li key={j.id} onClick={() => navigate("/operations")}
                          className="cursor-pointer font-body text-[12px] text-[#F8FAFC] hover:text-[#00E5FF]">
                        · {j.title} <span className="text-[#52525B] font-data text-[10px] uppercase tracking-widest">[{j.state}]</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="border-t border-[#27272A] pt-3 space-y-2 font-data text-[11px]">
            {Object.entries(details.entity).map(([k, v]) => {
              if (["id", "name", "codename", "label", "title", "truth", "state", "trust",
                   "service_id", "repo", "depends_on", "last_check"].includes(k)) return null;
              if (typeof v === "object" || v === undefined || v === null || v === "") return null;
              return (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-[#52525B] uppercase tracking-widest">{k}</span>
                  <span className="text-[#F8FAFC] text-right truncate">{String(v)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#27272A] pt-3">
            <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2">Governance</div>
            <div className="text-[11px] font-body text-[#94A3B8] leading-relaxed">
              Any action on this entity must pass governance policies. Approvals require operator <span className="text-[#00E5FF]">JR</span>.
            </div>
          </div>

          {relatedArtifacts.length > 0 && (
            <div className="border-t border-[#27272A] pt-3" data-testid="facet-artifacts">
              <div className="font-data text-[10px] uppercase tracking-widest text-[#52525B] mb-2">
                Related artifacts · {relatedArtifacts.length}
              </div>
              <ul className="space-y-1">
                {relatedArtifacts.slice(0, 6).map((a) => (
                  <li key={a.id} onClick={() => navigate("/operations")}
                      className="cursor-pointer font-data text-[11px] text-[#F8FAFC] hover:text-[#00E5FF] flex items-center gap-2">
                    <span>{a.id}</span>
                    <span className="text-[#52525B] uppercase tracking-widest text-[10px]">{a.class}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-widest" style={{ color: a.verified ? "#10B981" : "#94A3B8" }}>
                      {a.verified ? "VERIFIED" : "UNVERIFIED"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
