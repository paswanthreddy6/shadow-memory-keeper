import { createFileRoute } from "@tanstack/react-router";
import { feedbackSchema, feedbackToMemory } from "@/lib/memory-schemas";

export const Route = createFileRoute("/api/feedback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { json, parseBody, fail } = await import("@/lib/api-helpers.server");
        const { retainMemory } = await import("@/services/hindsight.server");
        const parsed = await parseBody(request, feedbackSchema);
        if ("error" in parsed) return parsed.error;
        try {
          const memory = await retainMemory(feedbackToMemory(parsed.data));
          return json({ success: true, message: "Memory retained.", memory });
        } catch (e) {
          return fail(e);
        }
      },
    },
  },
});
