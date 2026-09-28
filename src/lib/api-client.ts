import { queryOptions } from "@tanstack/react-query";
import type { ApiError, ChatResponse, HealthResponse, MemoriesResponse, RetainResult } from "@/types/memory";

export class ShadowApiError extends Error {
  constructor(
    message: string,
    public code: ApiError["code"],
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ShadowApiError("Could not reach SHADOW's server.", "unreachable");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body as ApiError | null;
    throw new ShadowApiError(err?.error ?? "Something went wrong.", err?.code ?? "unknown");
  }
  return body as T;
}

export const api = {
  health: () => request<HealthResponse>("/api/health"),
  memories: (q = "", type = "") => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    return request<MemoriesResponse>(`/api/memories${p.size ? `?${p}` : ""}`);
  },
  retain: (kind: "feedback" | "meetings" | "decisions" | "competitors", data: unknown) =>
    request<RetainResult>(`/api/${kind}`, { method: "POST", body: JSON.stringify(data) }),
  demo: () => request<{ success: true; message: string; count: number }>("/api/demo", { method: "POST" }),
  chat: (message: string) =>
    request<ChatResponse>("/api/chat", { method: "POST", body: JSON.stringify({ message }) }),
};

export const memoriesQuery = queryOptions({
  queryKey: ["memories"],
  queryFn: () => api.memories(),
  staleTime: 15_000,
});

export const healthQuery = queryOptions({ queryKey: ["health"], queryFn: api.health, staleTime: 60_000 });
