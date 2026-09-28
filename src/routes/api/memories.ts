import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/memories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { json, fail } = await import("@/lib/api-helpers.server");
        const { listMemories, recallMemories, groupRecords } = await import("@/services/hindsight.server");
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").trim().slice(0, 500);
        const type = url.searchParams.get("type") ?? "";
        const factType = ["world", "experience", "observation"].includes(type) ? type : undefined;
        try {
          if (q) {
            const items = await recallMemories(q, factType ? [factType] : undefined);
            return json({ items, records: groupRecords(items), total: items.length, mode: "recall" });
          }
          const { items, total } = await listMemories({ limit: 500, ...(factType ? { type: factType } : {}) });
          return json({ items, records: groupRecords(items), total, mode: "list" });
        } catch (e) {
          return fail(e);
        }
      },
    },
  },
});
