import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Network, Users, Workflow, BookOpen, Database,
  Server, Scale, History, MessageSquareText,
} from "lucide-react";
import { useCell } from "@/state/CellContext";

const NAV = [
  { to: "/",           label: "COMMAND CENTER", icon: LayoutGrid,      testId: "nav-command" },
  { to: "/map",        label: "MASTER L@B MAP", icon: Network,          testId: "nav-map" },
  { to: "/teams",      label: "ELITE TEAMS",    icon: Users,            testId: "nav-teams" },
  { to: "/operations", label: "OPERATIONS",     icon: Workflow,         testId: "nav-ops" },
  { to: "/knowledge",  label: "KNOWLEDGE",      icon: BookOpen,         testId: "nav-knowledge" },
  { to: "/memory",     label: "MEMORY",         icon: Database,         testId: "nav-memory" },
  { to: "/runtime",    label: "RUNTIME",        icon: Server,           testId: "nav-runtime" },
  { to: "/governance", label: "GOVERNANCE",     icon: Scale,            testId: "nav-governance" },
  { to: "/history",    label: "HISTORY",        icon: History,          testId: "nav-history" },
];

export default function LeftNav() {
  const { convoOpen, setConvoOpen } = useCell();
  return (
    <aside
      data-testid="left-nav"
      className="w-60 shrink-0 border-r border-[#27272A] bg-[#0B0D10] flex flex-col"
    >
      <div className="px-4 py-4 border-b border-[#27272A]">
        <div className="font-data text-[10px] text-[#52525B] uppercase tracking-[0.2em]">Operator</div>
        <div className="font-display text-sm text-[#F8FAFC] mt-0.5">JR → CELL → L@B</div>
        <div className="mt-2 font-data text-[10px] text-[#00E5FF] uppercase tracking-widest">THE MAP IS THE TRUTH</div>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, testId }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            data-testid={testId}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 h-9 border-l-2 ${
                isActive
                  ? "border-l-[#00E5FF] bg-[#0F1115] text-[#F8FAFC]"
                  : "border-l-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F1115]"
              }`
            }
          >
            <Icon size={14} strokeWidth={1.75} />
            <span className="font-display text-[11px] tracking-[0.18em]">{label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        data-testid="toggle-conversation-panel"
        onClick={() => setConvoOpen(!convoOpen)}
        className="border-t border-[#27272A] px-4 h-11 flex items-center gap-3 text-[#94A3B8] hover:text-[#00E5FF] hover:bg-[#0F1115]"
      >
        <MessageSquareText size={14} />
        <span className="font-display text-[11px] tracking-[0.18em]">
          {convoOpen ? "HIDE CELL CONSOLE" : "SHOW CELL CONSOLE"}
        </span>
      </button>
    </aside>
  );
}
