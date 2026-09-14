// Reusable artifact viewer with provenance panel. Renders per §10-11.
import React from "react";
import { useCell } from "@/state/CellContext";
import { cellApi } from "@/services/cellApi";
import { toast } from "sonner";
import ServiceTruthPill from "@/components/ServiceTruthPill";
import { FileText, Image as ImageIcon, Film, FileCode, FileJson, Braces, Camera, CheckCircle2 } from "lucide-react";

const CLASS_ICON = {
  IMAGE: ImageIcon, VIDEO: Film, MARKDOWN: FileText, CODE: FileCode,
  HTML: Braces, JSON: FileJson, TEXT: FileText, SCREENSHOT: Camera,
};

function Provenance({ a }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-1.5 font-data text-[11px]">
      <span className="text-[#52525B] uppercase tracking-widest">Where from</span>
      <span className="text-[#F8FAFC]">{a.producer || "—"}</span>
      <span className="text-[#52525B] uppercase tracking-widest">Job</span>
      <span className="text-[#F8FAFC]">{a.job_id || "—"}</span>
      <span className="text-[#52525B] uppercase tracking-widest">Mission</span>
      <span className="text-[#F8FAFC]">{a.mission_id || "—"}</span>
      <span className="text-[#52525B] uppercase tracking-widest">Created</span>
      <span className="text-[#F8FAFC]">{a.created || "—"}</span>
      <span className="text-[#52525B] uppercase tracking-widest">Truth</span>
      <span><ServiceTruthPill state={a.truth} /></span>
    </div>
  );
}

function Body({ a }) {
  const c = (a.class || "").toUpperCase();
  if (!a.content_ref) {
    return (
      <div className="p-6 font-data text-[11px] uppercase tracking-widest text-[#FB7185]">
        No content — source is {a.truth}. Cannot display.
      </div>
    );
  }
  if (c === "IMAGE" || c === "SCREENSHOT") {
    return <img src={a.content_ref} alt={c} className="max-h-[360px] w-full object-contain bg-[#050505] border-b border-[#27272A]" />;
  }
  if (c === "VIDEO") {
    return <video src={a.content_ref} controls className="max-h-[360px] w-full bg-[#050505] border-b border-[#27272A]" />;
  }
  if (c === "MARKDOWN" || c === "TEXT" || c === "CODE" || c === "JSON" || c === "HTML") {
    return (
      <pre className="p-4 font-data text-[12px] leading-relaxed text-[#F8FAFC] whitespace-pre-wrap max-h-[360px] overflow-y-auto bg-[#050505] border-b border-[#27272A]">
        {a.content_ref}
      </pre>
    );
  }
  return <div className="p-4 font-data text-[11px] text-[#94A3B8]">{a.content_ref}</div>;
}

export default function ArtifactStage({ artifact, onVerified }) {
  const { refresh } = useCell();
  if (!artifact) return null;
  const Icon = CLASS_ICON[(artifact.class || "").toUpperCase()] || FileText;

  const doVerify = async () => {
    try {
      await cellApi.verifyArtifact(artifact.id);
      toast(`Artifact ${artifact.id} verified`);
      await refresh();
      onVerified?.();
    } catch (e) {
      toast(e?.response?.data?.detail || "Verify failed");
    }
  };

  return (
    <div data-testid={`artifact-stage-${artifact.id}`} className="border border-[#27272A] bg-[#0B0D10]">
      <header className="h-9 px-3 border-b border-[#27272A] bg-[#0F1115] flex items-center gap-2">
        <Icon size={13} className="text-[#00E5FF]" />
        <span className="font-display text-[11px] tracking-[0.2em] uppercase text-[#F8FAFC]">
          ARTIFACT · {artifact.id} · {artifact.class}
        </span>
        <span className="ml-auto flex items-center gap-2">
          {artifact.verified
            ? <span className="font-data text-[10px] uppercase tracking-widest text-[#10B981] flex items-center gap-1"><CheckCircle2 size={11} /> VERIFIED</span>
            : <button data-testid={`verify-artifact-${artifact.id}`} onClick={doVerify}
                      disabled={artifact.truth === "DOWN"}
                      className="px-2 py-0.5 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF18] disabled:opacity-30 disabled:cursor-not-allowed font-data text-[10px] uppercase tracking-widest">
                Verify
              </button>}
        </span>
      </header>
      <Body a={artifact} />
      <div className="p-3">
        <Provenance a={artifact} />
      </div>
    </div>
  );
}
