import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/shadow/AppShell";
import { AREAS, CaptureDialog } from "@/components/shadow/CaptureDialog";
import { Dot, RecordCard, RecordsView } from "@/components/shadow/RecordsView";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Customer Feedback — SHADOW" },
      { name: "description", content: "Capture and search customer feedback retained in SHADOW's persistent product memory." },
      { property: "og:title", content: "Customer Feedback — SHADOW" },
      { property: "og:description", content: "Every customer signal, retained and searchable." },
    ],
  }),
  component: FeedbackPage,
});

const PRIO: Record<string, string> = {
  Critical: "text-destructive",
  High: "text-primary",
  Medium: "text-kind-feedback",
  Low: "text-muted-foreground",
};

function FeedbackPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Retain"
        title="Customer Feedback"
        subtitle="What customers told you — kept with its context, so it's still there when the question comes."
        action={
          <CaptureDialog
            endpoint="feedback"
            title="Capture feedback"
            description="Stored in Hindsight as persistent product memory."
            trigger="Capture Feedback"
            successMessage="Memory retained."
            fields={[
              { name: "customer", label: "Customer", type: "text", placeholder: "Acme Corp" },
              { name: "title", label: "Title", type: "text", placeholder: "Checkout requires an account" },
              { name: "feedback", label: "Feedback", type: "textarea", placeholder: "What did they say?" },
              { name: "productArea", label: "Product area", type: "select", options: AREAS },
              { name: "priority", label: "Priority", type: "select", options: ["High", "Critical", "Medium", "Low"] },
              { name: "date", label: "Date", type: "date" },
            ]}
          />
        }
      />
      <RecordsView
        kind="feedback"
        filters={[
          { key: "priority", label: "Priorities" },
          { key: "customer", label: "Customers" },
          { key: "productArea", label: "Areas" },
        ]}
        render={(r) => (
          <RecordCard
            r={r}
            title={r.metadata["title"] ?? r.facts[0]?.text ?? "Feedback"}
            meta={
              <>
                <span className="text-kind-feedback">{r.metadata["customer"] ?? "Customer"}</span>
                <Dot />
                <span>{r.metadata["productArea"]}</span>
                <Dot />
                <span className={cn(PRIO[r.metadata["priority"] ?? ""])}>{r.metadata["priority"]}</span>
                <Dot />
                <span>{r.date}</span>
              </>
            }
          >
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {r.facts.slice(0, 3).map((f) => (
                <li key={f.id}>{f.text}</li>
              ))}
            </ul>
          </RecordCard>
        )}
      />
    </AppShell>
  );
}
