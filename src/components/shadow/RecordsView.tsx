import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { memoriesQuery } from "@/lib/api-client";
import type { MemoryKind, MemoryRecord } from "@/types/memory";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, ListSkeleton } from "./States";

/** Lists retained source records of one kind, reassembled from Hindsight memories. */
export function RecordsView({
  kind,
  filters = [],
  render,
  layout = "list",
}: {
  kind: MemoryKind;
  filters?: { key: string; label: string }[];
  render: (r: MemoryRecord) => ReactNode;
  layout?: "list" | "timeline";
}) {
  const { data, isLoading, error } = useQuery(memoriesQuery);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string>>({});

  const records = useMemo(() => (data?.records ?? []).filter((r) => r.kind === kind), [data, kind]);
  const options = useMemo(
    () =>
      Object.fromEntries(
        filters.map((f) => [f.key, [...new Set(records.map((r) => r.metadata[f.key]).filter(Boolean))].sort()]),
      ),
    [records, filters],
  );
  const shown = records.filter((r) => {
    const hay = [...Object.values(r.metadata), ...r.facts.map((f) => f.text)].join(" ").toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    return filters.every((f) => !sel[f.key] || r.metadata[f.key] === sel[f.key]);
  });

  if (isLoading) return <ListSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
        </div>
        {filters.map((f) => (
          <select
            key={f.key}
            value={sel[f.key] ?? ""}
            onChange={(e) => setSel((s) => ({ ...s, [f.key]: e.target.value }))}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground"
          >
            <option value="" className="bg-popover">All {f.label.toLowerCase()}</option>
            {(options[f.key] ?? []).map((o) => (
              <option key={o} value={o} className="bg-popover">{o}</option>
            ))}
          </select>
        ))}
      </div>
      {records.length === 0 ? (
        <EmptyState />
      ) : shown.length === 0 ? (
        <EmptyState message="Nothing matches these filters." />
      ) : layout === "timeline" ? (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {shown.map((r) => (
            <li key={r.documentId} className="relative">
              <span className="absolute -left-[31px] top-5 size-2.5 rounded-full border-2 border-background bg-primary" />
              {render(r)}
            </li>
          ))}
        </ol>
      ) : (
        <div className="grid gap-3">{shown.map((r) => <div key={r.documentId}>{render(r)}</div>)}</div>
      )}
      <p className="mt-6 font-mono text-[10px] text-muted-foreground/60">
        {shown.length} record{shown.length === 1 ? "" : "s"} · retrieved live from Hindsight
      </p>
    </div>
  );
}

export function RecordCard({ r, title, meta, children }: { r: MemoryRecord; title: string; meta: ReactNode; children?: ReactNode }) {
  return (
    <article className="rounded-xl border border-border bg-card/70 p-5 transition-colors hover:border-foreground/15">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
        {meta}
        {r.metadata["demo"] === "true" && (
          <span className="rounded border border-border px-1.5 text-[10px] uppercase">Demo · fictional</span>
        )}
      </div>
      <h3 className="mt-2 text-base font-medium text-foreground">{title}</h3>
      {children}
    </article>
  );
}

export function Dot() {
  return <span className="text-muted-foreground/40">·</span>;
}
