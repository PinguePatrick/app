import React, { useEffect, useRef, useState } from "react";
import { useCell } from "@/state/CellContext";
import { cellScript } from "@/data/demo";
import { Send, Minus, Terminal } from "lucide-react";

// Dockable CELL conversation panel. Scripted, deterministic. Clearly labeled.
export default function ConversationPanel() {
  const { convoOpen, setConvoOpen } = useCell();
  const [msgs, setMsgs] = useState([
    { who: "cell", text: "CELL online. Posture OBSERVE. I operate L@B on your behalf, JR." },
    { who: "cell", text: "Ask me about the map, missions, approvals, risks, or simulations." },
  ]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, convoOpen]);

  const send = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    const rule = cellScript.find((r) => r.match.test(text));
    const reply = rule?.reply ??
      "I will not fabricate an answer. That entity is not on the map. Add it, then ask me again. — CELL";
    setMsgs((m) => [...m, { who: "jr", text }, { who: "cell", text: reply }]);
    setInput("");
  };

  if (!convoOpen) return null;

  return (
    <div
      data-testid="conversation-panel"
      className="fixed right-4 bottom-4 w-[380px] max-w-[calc(100vw-2rem)] h-[420px] border border-[#27272A] bg-[#0B0D10] shadow-[0_0_0_1px_rgba(0,229,255,0.06)] flex flex-col z-40"
    >
      <header className="h-9 border-b border-[#27272A] px-3 flex items-center justify-between bg-[#0F1115]">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-[#00E5FF]" />
          <span className="font-display text-[11px] tracking-[0.2em] text-[#F8FAFC]">CELL // CONSOLE</span>
          <span className="font-data text-[9px] text-[#52525B] uppercase tracking-widest ml-1">scripted</span>
        </div>
        <button data-testid="minimize-convo" onClick={() => setConvoOpen(false)} className="text-[#52525B] hover:text-[#F8FAFC]">
          <Minus size={14} />
        </button>
      </header>
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-3 scanlines">
        {msgs.map((m, i) => (
          <div key={i} className="font-data text-[12px] leading-relaxed">
            <div className={`text-[10px] uppercase tracking-widest mb-0.5 ${m.who === "cell" ? "text-[#00E5FF]" : "text-[#94A3B8]"}`}>
              {m.who === "cell" ? "CELL" : "JR"}
            </div>
            <div className={m.who === "cell" ? "text-[#F8FAFC]" : "text-[#94A3B8]"}>
              <span className="text-[#3F3F46]">{m.who === "cell" ? "←" : "→"} </span>{m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="border-t border-[#27272A] p-2 flex items-center gap-2">
        <span className="font-data text-[11px] text-[#00E5FF]">JR&gt;</span>
        <input
          data-testid="convo-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ask cell…"
          className="flex-1 bg-transparent outline-none font-data text-[12px] text-[#F8FAFC] placeholder:text-[#3F3F46]"
        />
        <button data-testid="convo-send" type="submit" className="text-[#94A3B8] hover:text-[#00E5FF]">
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
