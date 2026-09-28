import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const { json } = await import("@/lib/api-helpers.server");
        const { isConfigured, getBankId } = await import("@/services/hindsight.server");
        return json({ ok: true, hindsightConfigured: isConfigured(), bankId: getBankId() });
      },
    },
  },
});
