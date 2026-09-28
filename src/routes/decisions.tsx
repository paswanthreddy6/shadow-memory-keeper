import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/shadow/AppShell";
import { AREAS, CaptureDialog } from "@/components/shadow/CaptureDialog";
import { RecordsView } from "@/components/shadow/RecordsView";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/decisions")({
  head: () => ({
    meta: [
      { title: "Product Decisions — SHADOW" },
      { name: "description", content: "A timeline of product decisions with the rationale preserved." },
      { property: "og:title", content: "Product Decisions — SHADOW" },
      { property: "og:description", content: "Never lose the why behind a decision." },
    ],
  }),
  component: DecisionsPage,
});

const STATUS: Record<string, string> = {
  Approved: "border-kind-meeting/40 text-kind-meeting",
  Shipped: "border-kind-feedback/40 text-kind-feedback",
  Postponed: "border-primary/40 text-primary",
  Rejected: "border-destructive/40 text-destructive",
  Proposed: "border-border text-muted-foreground",
};

function DecisionsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Retain"
        title="Product Decisions"
        subtitle="What was decided, and why — so the answer to “why did we do this?” never walks out the door."
        action={
          <CaptureDialog
            endpoint="decisions"
            title="Add decision"
            description="The rationale is retained so SHADOW can explain it later."
            trigger="Add Decision"
            successMessage="Decision saved."
            fields={[
              { name: "title", label: "Title", type: "text", placeholder: "Postpone one-click checkout" },
              { name: "decision", label: "Decision", type: "textarea", rows: 3 },
              { name: "rationale", label: "Rationale", type: "textarea", rows: 3 },
              { name: "alternatives", label: "Alternatives considered (optional)", type: "textarea", rows: 2, required: false },
              { name: "status", label: "Status", type: "select", options: ["Approved", "Proposed", "Postponed", "Rejected", "Shipped"] },
              { name: "productArea", label: "Product area", type: "select", options: AREAS },
              { name: "date", label: "Date", type: "date" },
            ]}
          />
        }
      />
      <RecordsView
        kind="decision"
        layout="timeline"
        filters={[{ key: "status", label: "Statuses" }, { key: "productArea", label: "Areas" }]}
        render={(r) => {
          const m = r.metadata;
          return (
            <article className="rounded-xl border border-primary/15 bg-card/80 p-5">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <span>{r.date}</span>
                <span className={cn("rounded-full border px-2 py-0.5 uppercase tracking-wider", STATUS[m["status"] ?? ""] ?? STATUS["Proposed"])}>
                  {m["status"] ?? "Decision"}
                </span>
                <span>{m["productArea"]}</span>
                {m["demo"] === "true" && <span className="rounded border border-border px-1.5 text-[10px] uppercase">Demo · fictional</span>}
              </div>
              <h3 className="mt-3 font-display text-2xl text-foreground">{m["title"] ?? "Decision"}</h3>
              <p className="mt-2 text-sm text-foreground/85">{m["decision"] ?? r.facts[0]?.text}</p>
              {m["rationale"] && (
                <div className="mt-4 border-l-2 border-primary/50 pl-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Rationale</p>
                  <p className="mt-1 text-sm text-muted-foreground">{m["rationale"]}</p>
                </div>
              )}
              {m["alternatives"] && (
                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="text-foreground/70">Alternatives:</span> {m["alternatives"]}
                </p>
              )}
            </article>
          );
        }}
      />
    </AppShell>
  );
}
