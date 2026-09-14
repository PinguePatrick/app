import React from "react";
import { useNavigate } from "react-router-dom";
import { useCell } from "@/state/CellContext";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator,
} from "@/components/ui/command";
import { LayoutGrid, Network, Users, Workflow, BookOpen, Database, Server, Scale, History, ArrowRight } from "lucide-react";

const NAV = [
  { to: "/",           label: "Command Center", icon: LayoutGrid },
  { to: "/map",        label: "Master L@B Map", icon: Network },
  { to: "/teams",      label: "Elite Teams",    icon: Users },
  { to: "/operations", label: "Operations",     icon: Workflow },
  { to: "/knowledge",  label: "Knowledge",      icon: BookOpen },
  { to: "/memory",     label: "Memory",         icon: Database },
  { to: "/runtime",    label: "Runtime",        icon: Server },
  { to: "/governance", label: "Governance",     icon: Scale },
  { to: "/history",    label: "History",        icon: History },
];

export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen, systems, agents, missions, select } = useCell();
  const navigate = useNavigate();

  const go = (to) => { setPaletteOpen(false); navigate(to); };
  const openEntity = (kind, id, to) => { select(kind, id); setPaletteOpen(false); navigate(to); };

  return (
    <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
      <CommandInput data-testid="command-palette-input" placeholder="Command…  navigate · systems · agents · missions" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No matches. CELL will not fabricate results.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV.map(({ to, label, icon: Icon }) => (
            <CommandItem key={to} onSelect={() => go(to)} data-testid={`palette-nav-${to.replace("/", "") || "home"}`}>
              <Icon size={13} className="mr-2 text-[#00E5FF]" />
              <span className="font-data text-[12px]">{label}</span>
              <ArrowRight size={12} className="ml-auto text-[#3F3F46]" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Systems">
          {systems.map((s) => (
            <CommandItem key={s.id} onSelect={() => openEntity("system", s.id, "/map")} data-testid={`palette-system-${s.id}`}>
              <span className="font-data text-[12px] text-[#F8FAFC]">{s.name}</span>
              <span className="ml-auto font-data text-[10px] text-[#52525B] uppercase tracking-widest">{s.truth}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Agents">
          {agents.map((a) => (
            <CommandItem key={a.id} onSelect={() => openEntity("agent", a.id, "/teams")}>
              <span className="font-data text-[12px] text-[#F8FAFC]">{a.name}</span>
              <span className="ml-auto font-data text-[10px] text-[#52525B] uppercase tracking-widest">{a.role}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Missions">
          {missions.map((m) => (
            <CommandItem key={m.id} onSelect={() => openEntity("mission", m.id, "/operations")}>
              <span className="font-data text-[12px] text-[#F8FAFC]">{m.codename}</span>
              <span className="ml-auto font-data text-[10px] text-[#52525B] uppercase tracking-widest">{m.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
