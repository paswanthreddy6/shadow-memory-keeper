import { createFileRoute } from "@tanstack/react-router";
import { decisionSchema, decisionToMemory } from "@/lib/memory-schemas";

export const Route = createFileRoute("/api/decisions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { json, parseBody, fail } = await import("@/lib/api-helpers.server");
        const { retainMemory } = await import("@/services/hindsight.server");
        const parsed = await parseBody(request, decisionSchema);
        if ("error" in parsed) return parsed.error;
        try {
          const memory = await retainMemory(decisionToMemory(parsed.data));
          return json({ success: true, message: "Decision saved.", memory });
        } catch (e) {
          return fail(e);
        }
      },
    },
  },
});
