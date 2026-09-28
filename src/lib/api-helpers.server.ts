import type { z } from "zod";
import { toApiError } from "@/services/hindsight.server";

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}

export async function parseBody<S extends z.ZodTypeAny>(request: Request, schema: S) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: json({ code: "invalid_input", error: "Request body must be JSON." }, 400) } as const;
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { error: json({ code: "invalid_input", error: msg }, 400) } as const;
  }
  return { data: parsed.data as z.output<S> } as const;
}

export function fail(e: unknown) {
  const { status, body } = toApiError(e);
  return json(body, status);
}
