import { createFileRoute } from "@tanstack/react-router";
import { competitorSchema, competitorToMemory } from "@/lib/memory-schemas";

export const Route = createFileRoute("/api/competitors")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { json, parseBody, fail } = await import("@/lib/api-helpers.server");
        const { retainMemory } = await import("@/services/hindsight.server");
        const parsed = await parseBody(request, competitorSchema);
        if ("error" in parsed) return parsed.error;
        try {
          const memory = await retainMemory(competitorToMemory(parsed.data));
          return json({ success: true, message: "Competitor observation saved.", memory });
        } catch (e) {
          return fail(e);
        }
      },
    },
  },
});
