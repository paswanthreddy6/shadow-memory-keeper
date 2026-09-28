import { createFileRoute } from "@tanstack/react-router";
import { chatSchema } from "@/lib/memory-schemas";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { json, parseBody, fail } = await import("@/lib/api-helpers.server");
        const { recallMemories, reflectOnMemories } = await import("@/services/hindsight.server");
        const parsed = await parseBody(request, chatSchema);
        if ("error" in parsed) return parsed.error;
        const question = parsed.data.message;
        try {
          // 1. RECALL relevant history
          const memories = await recallMemories(question);
          if (memories.length === 0) {
            return json({
              answer:
                "I don't have enough stored product memory to answer that yet. Capture related feedback, meetings or decisions — or load the demo — and ask again.",
              memories: [],
              sources: [],
              insufficient: true,
            });
          }
          // 2. REFLECT across memories for a grounded synthesis
          const reflection = await reflectOnMemories(
            `${question}\n\nAnswer only from SHADOW's retained product memories. Reference the specific feedback, meetings, decisions or competitor observations you rely on. If the memories don't support an answer, say the evidence is insufficient.`,
          );
          return json({
            answer: reflection.text,
            memories: memories.slice(0, 12),
            sources: reflection.basedOn,
            insufficient: false,
          });
        } catch (e) {
          return fail(e);
        }
      },
    },
  },
});
