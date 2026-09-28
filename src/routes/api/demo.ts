import { createFileRoute } from "@tanstack/react-router";
import { buildDemoMemories } from "@/lib/demo-data";

export const Route = createFileRoute("/api/demo")({
  server: {
    handlers: {
      POST: async () => {
        const { json, fail } = await import("@/lib/api-helpers.server");
        const { retainMany } = await import("@/services/hindsight.server");
        try {
          const drafts = buildDemoMemories();
          const res = await retainMany(drafts);
          return json({ success: true, message: "Demo memory loaded.", count: drafts.length, async: res.async });
        } catch (e) {
          return fail(e);
        }
      },
    },
  },
});
