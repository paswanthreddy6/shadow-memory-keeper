import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/shadow/AppShell";
import { AREAS, CaptureDialog } from "@/components/shadow/CaptureDialog";
import { Dot, RecordCard, RecordsView } from "@/components/shadow/RecordsView";

export const Route = createFileRoute("/competitors")({
  head: () => ({
    meta: [
      { title: "Competitor Intelligence — SHADOW" },
      { name: "description", content: "Competitor observations retained alongside your own product history." },
      { property: "og:title", content: "Competitor Intelligence — SHADOW" },
      { property: "og:description", content: "The market around you, remembered." },
    ],
  }),
  component: CompetitorsPage,
});

function CompetitorsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Retain"
        title="Competitors"
        subtitle="Market moves, kept next to the customer signals and decisions they affect."
        action={
          <CaptureDialog
            endpoint="competitors"
            title="Add observation"
            description="Retained so SHADOW can weigh competitive pressure in its answers."
            trigger="Add Observation"
            successMessage="Competitor observation saved."
            fields={[
              { name: "competitor", label: "Competitor", type: "text", placeholder: "SwiftBasket" },
              { name: "observation", label: "Observation", type: "textarea" },
              { name: "productArea", label: "Product area", type: "select", options: AREAS },
              { name: "source", label: "Source (optional)", type: "text", required: false, placeholder: "Launch blog" },
              { name: "date", label: "Date", type: "date" },
            ]}
          />
        }
      />
      <RecordsView
        kind="competitor"
        filters={[{ key: "competitor", label: "Competitors" }, { key: "productArea", label: "Areas" }]}
        render={(r) => (
          <RecordCard
            r={r}
            title={r.metadata["competitor"] ?? "Competitor"}
            meta={
              <>
                <span className="text-kind-competitor">{r.metadata["productArea"]}</span>
                <Dot />
                <span>{r.date}</span>
                {r.metadata["source"] && (
                  <>
                    <Dot />
                    <span>{r.metadata["source"]}</span>
                  </>
                )}
              </>
            }
          >
            <p className="mt-2 text-sm text-muted-foreground">
              {r.metadata["observation"] ?? r.facts.map((f) => f.text).join(" ")}
            </p>
          </RecordCard>
        )}
      />
    </AppShell>
  );
}
