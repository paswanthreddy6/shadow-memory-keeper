import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Brain, Loader2, Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/shadow/AppShell";
import { KindBadge } from "@/components/shadow/KindBadge";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shadow/States";
import { api } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "AI Memory — SHADOW" },
      { name: "description", content: "Browse and semantically recall every memory in SHADOW's Hindsight bank." },
      { property: "og:title", content: "AI Memory — SHADOW" },
      { property: "og:description", content: "World facts, experiences and observations — recalled by meaning." },
    ],
  }),
  component: MemoryPage,
});

const TYPES = [
  { v: "", l: "All" },
  { v: "world", l: "World" },
  { v: "experience", l: "Experience" },
  { v: "observation", l: "Observation" },
];

function MemoryPage() {
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["memories", "browse", q, type],
    queryFn: () => api.memories(q, type),
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recall"
        title="AI Memory"
        subtitle="Everything SHADOW has learned. Search by meaning — Hindsight recalls what's relevant, not just what matches."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQ(draft.trim());
        }}
        className="mb-4 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Recall a concept — e.g. fraud risk, checkout friction…"
            className="h-11 pl-9"
          />
        </div>
        <Button type="submit" disabled={isFetching} className="h-11 gap-2">
          {isFetching && q ? <Loader2 className="size-4 animate-spin" /> : <Brain className="size-4" />}
          {isFetching && q ? "Recalling..." : "Recall"}
        </Button>
      </form>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t.v}
            onClick={() => setType(t.v)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
              type === t.v ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t.l}
          </button>
        ))}
        {q && (
          <button onClick={() => { setQ(""); setDraft(""); }} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
            Clear recall “{q}”
          </button>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState error={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState message={q ? "Nothing in memory relates to that yet." : undefined} />
      ) : (
        <>
          <p className="mb-3 font-mono text-[11px] text-muted-foreground">
            {data.mode === "recall" ? `${data.items.length} memories recalled by relevance` : `${data.total} memories in bank`}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {data.items.map((m, i) => (
              <article key={m.id} className="flex flex-col rounded-xl border border-border bg-card/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <KindBadge kind={m.kind} />
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">
                    {data.mode === "recall" && <span className="mr-2 text-primary">#{i + 1}</span>}
                    {m.factType ?? "memory"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{m.text}</p>
                <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 font-mono text-[10px] text-muted-foreground">
                  {m.date && <span>{m.date.slice(0, 10)}</span>}
                  {m.metadata["title"] && <span className="truncate">src · {m.metadata["title"]}</span>}
                  {m.metadata["demo"] === "true" && <span>demo</span>}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
