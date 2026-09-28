import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/shadow/AppShell";
import { KindBadge } from "@/components/shadow/KindBadge";
import { api } from "@/lib/api-client";
import type { ChatResponse, MemoryItem } from "@/types/memory";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask SHADOW — AI Product Memory" },
      { name: "description", content: "Ask about customer patterns, past decisions and tradeoffs. Answers are grounded in retained memory." },
      { property: "og:title", content: "Ask SHADOW" },
      { property: "og:description", content: "Grounded answers from your product team's persistent memory." },
    ],
  }),
  component: AskPage,
});

export const SUGGESTED = [
  "What are our biggest recurring customer problems?",
  "Have customers complained about checkout before?",
  "What did our team previously decide about checkout?",
  "Why was one-click checkout postponed?",
  "Connect customer feedback with our previous decisions.",
  "What patterns do you see across our checkout feedback?",
];

type Turn = { q: string; res?: ChatResponse; error?: string };

const PHASES = ["Recalling...", "Reflecting...", "SHADOW is thinking..."];

function AskPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!busy) return;
    setPhase(0);
    const t = setInterval(() => setPhase((p) => Math.min(p + 1, PHASES.length - 1)), 2500);
    return () => clearInterval(t);
  }, [busy]);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [turns, busy]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    setTurns((t) => [...t, { q: question }]);
    try {
      const res = await api.chat(question);
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, res } : x)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not reach Hindsight.";
      toast.error(msg);
      setTurns((t) => t.map((x, i) => (i === t.length - 1 ? { ...x, error: msg } : x)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl flex-col">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Reflect</p>
          <h1 className="font-display text-5xl leading-none">Ask SHADOW</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Ask about customer patterns, past decisions, product tradeoffs, or the market around you.
          </p>
        </div>

        {turns.length === 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-xl border border-border bg-card/60 p-4 text-left text-sm text-foreground/85 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-10">
          {turns.map((t, i) => (
            <div key={i} className="space-y-4">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-4 py-2.5 text-sm">{t.q}</p>
              </div>
              {t.res ? (
                <AnswerBlock res={t.res} />
              ) : t.error ? (
                <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">{t.error}</p>
              ) : (
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin text-primary" /> {PHASES[phase]}
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="sticky bottom-4 mt-8 flex items-end gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            rows={1}
            placeholder="Ask about your product's history…"
            className="min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Ask">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}

function AnswerBlock({ res }: { res: ChatResponse }) {
  const sourceIds = new Set(res.sources.map((s) => s.id));
  const evidence = res.sources.length ? res.sources : res.memories.slice(0, 5);
  const related = res.memories.filter((m) => !sourceIds.has(m.id) && !evidence.includes(m)).slice(0, 6);
  const kinds = [...new Set(evidence.map((e) => e.kind))];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-primary/20 bg-card p-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" /> Answer
        </div>
        <div className="prose-shadow text-sm leading-relaxed text-foreground/90">
          <ReactMarkdown>{res.answer}</ReactMarkdown>
        </div>
        {kinds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">Based on:</span>
            {kinds.map((k) => (
              <KindBadge key={k} kind={k} />
            ))}
          </div>
        )}
      </section>
      {evidence.length > 0 && (
        <MemoryList title="Evidence" subtitle="Memories that informed this answer" items={evidence} accent />
      )}
      {related.length > 0 && <MemoryList title="Related memories" subtitle="Also recalled" items={related} />}
    </div>
  );
}

function MemoryList({ title, subtitle, items, accent }: { title: string; subtitle: string; items: MemoryItem[]; accent?: boolean }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      <div className="grid gap-2">
        {items.map((m) => (
          <div key={m.id} className={accent ? "rounded-lg border border-border bg-card/70 p-3" : "rounded-lg border border-border/60 p-3"}>
            <div className="mb-1.5 flex items-center gap-2">
              <KindBadge kind={m.kind} />
              {m.date && <span className="font-mono text-[10px] text-muted-foreground">{m.date.slice(0, 10)}</span>}
            </div>
            <p className="text-sm text-foreground/85">{m.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
