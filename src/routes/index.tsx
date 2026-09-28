import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Brain, Database, Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shadow/AppShell";
import { DemoLoader } from "@/components/shadow/DemoLoader";
import { KindBadge, KIND_STYLE } from "@/components/shadow/KindBadge";
import { EmptyState, ErrorState } from "@/components/shadow/States";
import { memoriesQuery } from "@/lib/api-client";
import { KIND_LABEL, type MemoryKind } from "@/types/memory";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SHADOW — AI Product Memory" },
      { name: "description", content: "Make the signal impossible to lose. Persistent AI memory for product teams: retain, recall, reflect." },
      { property: "og:title", content: "SHADOW — AI Product Memory" },
      { property: "og:description", content: "Make the signal impossible to lose." },
    ],
  }),
  component: Overview,
});

const FLOW = [
  { step: "Retain", line: "Capture what happened.", icon: Database },
  { step: "Recall", line: "Find what matters.", icon: Search },
  { step: "Reflect", line: "Understand what it means.", icon: Brain },
];

function Overview() {
  const { data, isLoading, error } = useQuery(memoriesQuery);
  const records = data?.records ?? [];
  const count = (k: MemoryKind) => records.filter((r) => r.kind === k).length;
  const metrics: { label: string; value: number; kind?: MemoryKind }[] = [
    { label: "Total memories", value: data?.total ?? 0 },
    { label: "Customer feedback", value: count("feedback"), kind: "feedback" },
    { label: "Meetings", value: count("meeting"), kind: "meeting" },
    { label: "Product decisions", value: count("decision"), kind: "decision" },
    { label: "Competitor observations", value: count("competitor"), kind: "competitor" },
  ];

  const themes = Object.entries(
    records.reduce<Record<string, number>>((acc, r) => {
      const a = r.metadata["productArea"];
      if (a) acc[a] = (acc[a] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // activity: records per month (real dates)
  const activity = Object.entries(
    records.reduce<Record<string, number>>((acc, r) => {
      const m = r.date?.slice(0, 7);
      if (m) acc[m] = (acc[m] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
  const maxAct = Math.max(1, ...activity.map((a) => a[1]));

  return (
    <AppShell>
      {/* Hero */}
      <section className="mb-14">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">AI Product Memory</p>
        <h1 className="font-display text-7xl leading-[0.9] sm:text-8xl">
          SHADOW<span className="text-primary">.</span>
        </h1>
        <p className="mt-5 font-display text-2xl italic text-foreground/90 sm:text-3xl">
          Make the signal impossible to lose.
        </p>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Your product team remembers everything — without having to remember everything.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Button asChild className="gap-2">
            <Link to="/ask"><Sparkles className="size-4" /> Ask SHADOW</Link>
          </Button>
          <Button asChild variant="secondary"><Link to="/feedback">Capture Feedback</Link></Button>
          <Button asChild variant="secondary"><Link to="/decisions">Add Decision</Link></Button>
          <Button asChild variant="secondary"><Link to="/meetings">Add Meeting</Link></Button>
        </div>
      </section>

      {/* Flow */}
      <section className="mb-14 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
        {FLOW.map((f, i) => (
          <FlowPiece key={f.step} f={f} i={i} last={i === FLOW.length - 1} />
        ))}
      </section>

      {/* Metrics */}
      <section className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-5">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {m.kind && <span className={cn("size-1.5 rounded-full", KIND_STYLE[m.kind].dot)} />}
              {m.label}
            </div>
            {isLoading ? (
              <Skeleton className="mt-2 h-9 w-12" />
            ) : (
              <div className="mt-1 font-display text-4xl">{error ? "—" : m.value}</div>
            )}
          </div>
        ))}
      </section>

      {error && <div className="mb-10"><ErrorState error={error} /></div>}

      {!isLoading && !error && records.length === 0 && (
        <section className="mb-10 grid gap-4 md:grid-cols-2">
          <EmptyState />
          <DemoLoader />
        </section>
      )}

      {records.length > 0 && (
        <section className="mb-14 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionTitle title="Recent memories" to="/memory" />
            <div className="space-y-2">
              {records.slice(0, 6).map((r) => (
                <div key={r.documentId} className="flex items-start gap-3 rounded-lg border border-border bg-card/60 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <KindBadge kind={r.kind} />
                      <span className="font-mono text-[10px] text-muted-foreground">{r.date}</span>
                    </div>
                    <p className="truncate text-sm">{r.metadata["title"] ?? r.facts[0]?.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <SectionTitle title="Recent decisions" to="/decisions" />
              <div className="space-y-2">
                {records.filter((r) => r.kind === "decision").slice(0, 3).map((r) => (
                  <div key={r.documentId} className="rounded-lg border border-primary/15 bg-card/60 p-3">
                    <p className="font-mono text-[10px] uppercase text-primary">{r.metadata["status"]} · {r.date}</p>
                    <p className="mt-1 text-sm">{r.metadata["title"]}</p>
                  </div>
                ))}
                {count("decision") === 0 && <p className="text-xs text-muted-foreground">No decisions retained yet.</p>}
              </div>
            </div>
            <div>
              <SectionTitle title="Top recurring themes" />
              <ul className="space-y-2">
                {themes.map(([t, n]) => (
                  <li key={t} className="text-sm">
                    <div className="flex justify-between"><span>{t}</span><span className="font-mono text-xs text-muted-foreground">{n}</span></div>
                    <div className="mt-1 h-1 rounded-full bg-secondary">
                      <div className="h-1 rounded-full bg-primary/70" style={{ width: `${(n / (themes[0]?.[1] ?? 1)) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionTitle title="Memory activity" />
              <div className="flex h-20 items-end gap-1.5">
                {activity.map(([m, n]) => (
                  <div key={m} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-sm bg-primary/60" style={{ height: `${(n / maxAct) * 56 + 4}px` }} title={`${n} in ${m}`} />
                    <span className="font-mono text-[9px] text-muted-foreground">{m.slice(5)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">records per month</p>
            </div>
            <DemoLoader compact />
          </div>
        </section>
      )}

      {/* Why */}
      <section className="rounded-2xl border border-border bg-card/50 p-8 md:p-10">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Why SHADOW</p>
        <div className="grid gap-6 md:grid-cols-2">
          <p className="font-display text-3xl leading-tight">
            The problem isn't lack of information. It's losing the connections between those memories.
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Product teams collect information everywhere: customer calls, meetings, tickets, decisions, competitor notes.</p>
            <p>SHADOW gives product teams persistent memory so today's question can use yesterday's context.</p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {(Object.keys(KIND_LABEL) as MemoryKind[]).map((k) => <KindBadge key={k} kind={k} />)}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function FlowPiece({ f, i, last }: { f: (typeof FLOW)[number]; i: number; last: boolean }) {
  const Icon = f.icon;
  return (
    <>
      <div className="rounded-xl border border-border bg-card/70 p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
          <Icon className="size-4 text-primary" />
        </div>
        <h3 className="mt-6 font-mono text-sm uppercase tracking-[0.2em]">{f.step}</h3>
        <p className="mt-1 font-display text-xl italic text-foreground/85">{f.line}</p>
      </div>
      {!last && (
        <div className="flex items-center justify-center py-1 md:px-1">
          <div className="h-8 w-px flow-line md:h-px md:w-10 md:rotate-0" />
        </div>
      )}
    </>
  );
}

function SectionTitle({ title, to }: { title: string; to?: "/memory" | "/decisions" }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
      {to && <Link to={to} className="text-xs text-muted-foreground hover:text-primary">View all →</Link>}
    </div>
  );
}
