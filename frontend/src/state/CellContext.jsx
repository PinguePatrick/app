import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { cellApi } from "@/services/cellApi";

const CellCtx = createContext(null);

export function CellProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    cell: null, mission: null, autonomy: null, jr: null, operator: null,
    systems: [], agents: [], teams: [], missions: [], tasks: [],
    sources: [], approvals: [], risks: [], events: [], history: [],
    map: { nodes: [], edges: [] }, memory: [], runtime: [], policies: [],
  });
  const [selection, setSelection] = useState(null); // { kind, id }
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [convoOpen, setConvoOpen] = useState(true);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    const [cell, mission, autonomy, jr, operator, systems, agents, teams, missions, tasks, sources, approvals, risks, events, history, map, memory, runtime, policies] =
      await Promise.all([
        cellApi.getCellState(), cellApi.getMission(), cellApi.getAutonomy(), cellApi.getJrState(),
        cellApi.getOperator(), cellApi.getSystems(), cellApi.getAgents(),
        cellApi.getTeams(), cellApi.getMissions(), cellApi.getTasks(), cellApi.getSources(),
        cellApi.getApprovals(), cellApi.getRisks(), cellApi.getEvents(), cellApi.getHistory(),
        cellApi.getMap(), cellApi.getMemory(), cellApi.getRuntime(), cellApi.getPolicies(),
      ]);
    setState({
      loading: false, cell, mission, autonomy, jr, operator, systems, agents, teams, missions, tasks,
      sources, approvals, risks, events, history, map, memory, runtime, policies,
    });
  }

  const select = useCallback((kind, id) => setSelection({ kind, id }), []);
  const clearSelection = useCallback(() => setSelection(null), []);

  // Cmd+K palette shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({
    ...state, selection, select, clearSelection, refresh,
    paletteOpen, setPaletteOpen, convoOpen, setConvoOpen,
  }), [state, selection, select, clearSelection, paletteOpen, convoOpen]);

  return <CellCtx.Provider value={value}>{children}</CellCtx.Provider>;
}

export function useCell() {
  const ctx = useContext(CellCtx);
  if (!ctx) throw new Error("useCell must be used inside <CellProvider>");
  return ctx;
}
