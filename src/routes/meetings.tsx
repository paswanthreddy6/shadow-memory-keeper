import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/shadow/AppShell";
import { AREAS, CaptureDialog } from "@/components/shadow/CaptureDialog";
import { Dot, RecordCard, RecordsView } from "@/components/shadow/RecordsView";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings — SHADOW" },
      { name: "description", content: "Meeting history retained as persistent product-team memory." },
      { property: "og:title", content: "Meetings — SHADOW" },
      { property: "og:description", content: "What the team discussed, and who was in the room." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Retain"
        title="Meetings"
        subtitle="The discussions behind the decisions."
        action={
          <CaptureDialog
            endpoint="meetings"
            title="Add meeting"
            description="Notes are retained so SHADOW can connect them to feedback and decisions."
            trigger="Add Meeting"
            successMessage="Meeting retained."
            fields={[
              { name: "title", label: "Title", type: "text", placeholder: "Checkout review" },
              { name: "date", label: "Date", type: "date" },
              { name: "participants", label: "Participants", type: "text", placeholder: "Maya (PM), Leo (Eng)" },
              { name: "productArea", label: "Product area", type: "select", options: AREAS },
              { name: "notes", label: "Notes", type: "textarea", rows: 6 },
            ]}
          />
        }
      />
      <RecordsView
        kind="meeting"
        filters={[{ key: "productArea", label: "Areas" }]}
        render={(r) => (
          <RecordCard
            r={r}
            title={r.metadata["title"] ?? "Meeting"}
            meta={
              <>
                <span className="text-kind-meeting">{r.date}</span>
                <Dot />
                <span>{r.metadata["productArea"]}</span>
              </>
            }
          >
            {r.metadata["participants"] && (
              <p className="mt-1 text-xs text-muted-foreground">With {r.metadata["participants"]}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {r.metadata["notes"] ?? r.facts.map((f) => f.text).join(" ")}
            </p>
          </RecordCard>
        )}
      />
    </AppShell>
  );
}
