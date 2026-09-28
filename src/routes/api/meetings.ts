import { createFileRoute } from "@tanstack/react-router";
import { meetingSchema, meetingToMemory } from "@/lib/memory-schemas";

export const Route = createFileRoute("/api/meetings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { json, parseBody, fail } = await import("@/lib/api-helpers.server");
        const { retainMemory } = await import("@/services/hindsight.server");
        const parsed = await parseBody(request, meetingSchema);
        if ("error" in parsed) return parsed.error;
        try {
          const memory = await retainMemory(meetingToMemory(parsed.data));
          return json({ success: true, message: "Meeting retained.", memory });
        } catch (e) {
          return fail(e);
        }
      },
    },
  },
});
