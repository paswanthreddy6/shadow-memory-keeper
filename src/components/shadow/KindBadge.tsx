import { KIND_LABEL, type MemoryKind } from "@/types/memory";
import { cn } from "@/lib/utils";
import { Gavel, MessageSquareQuote, Swords, Users, Sparkle } from "lucide-react";

export const KIND_STYLE: Record<MemoryKind, { dot: string; text: string; icon: typeof Users }> = {
  feedback: { dot: "bg-kind-feedback", text: "text-kind-feedback", icon: MessageSquareQuote },
  meeting: { dot: "bg-kind-meeting", text: "text-kind-meeting", icon: Users },
  decision: { dot: "bg-kind-decision", text: "text-kind-decision", icon: Gavel },
  competitor: { dot: "bg-kind-competitor", text: "text-kind-competitor", icon: Swords },
  general: { dot: "bg-kind-general", text: "text-kind-general", icon: Sparkle },
};

export function KindBadge({ kind, className }: { kind: MemoryKind; className?: string }) {
  const s = KIND_STYLE[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        s.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {KIND_LABEL[kind]}
    </span>
  );
}
