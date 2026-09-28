import { HindsightClient, HindsightError } from "@vectorize-io/hindsight-client";
import type { MemoryDraft } from "@/lib/memory-schemas";
import type { ApiError, MemoryItem, MemoryKind, MemoryRecord } from "@/types/memory";

const BANK_BACKGROUND =
  "SHADOW is an AI product intelligence system that helps product teams preserve customer feedback, meetings, product decisions, and competitor observations, then retrieve and reason across that history.";

const REFLECT_MISSION = `${BANK_BACKGROUND} When answering, ground every claim in retained memories, cite which customer feedback, meeting, decision or competitor observation it came from, and say plainly when the stored evidence is insufficient. Never invent decisions, customers, meetings or sources.`;

export class ConfigError extends Error {}

function config() {
  const apiKey = process.env["HINDSIGHT_API_KEY"];
  const baseUrl = process.env["HINDSIGHT_BASE_URL"] || "https://api.hindsight.vectorize.io";
  const bankId = process.env["HINDSIGHT_BANK_ID"] || "shadow-demo";
  return { apiKey, baseUrl, bankId };
}

export function getBankId() {
  return config().bankId;
}
export function isConfigured() {
  return Boolean(config().apiKey);
}

function client() {
  const { apiKey, baseUrl } = config();
  if (!apiKey) throw new ConfigError("missing key");
  return new HindsightClient({ baseUrl, apiKey });
}

let bankReady: Promise<void> | null = null;
export function ensureBank(): Promise<void> {
  if (!bankReady) {
    const { bankId } = config();
    bankReady = client()
      .createBank(bankId, { name: "SHADOW", reflectMission: REFLECT_MISSION, background: BANK_BACKGROUND })
      .then(() => undefined)
      .catch((e) => {
        bankReady = null;
        throw e;
      });
  }
  return bankReady;
}

function newDocId(kind: MemoryKind) {
  return `${kind}-${crypto.randomUUID()}`;
}

export async function retainMemory(draft: MemoryDraft) {
  await ensureBank();
  const documentId = newDocId(draft.kind);
  await client().retain(config().bankId, draft.content, {
    timestamp: `${draft.date}T12:00:00Z`,
    context: `${draft.kind}: ${draft.metadata["title"] ?? ""}`,
    metadata: draft.metadata,
    documentId,
    tags: draft.tags,
  });
  return { documentId, kind: draft.kind, content: draft.content, metadata: draft.metadata };
}

export async function retainMany(drafts: MemoryDraft[]) {
  await ensureBank();
  return client().retainBatch(
    config().bankId,
    drafts.map((d) => ({
      content: d.content,
      timestamp: `${d.date}T12:00:00Z`,
      context: `${d.kind}: ${d.metadata["title"] ?? ""}`,
      metadata: d.metadata,
      document_id: newDocId(d.kind),
      tags: d.tags,
    })),
    { async: true },
  );
}

/* ---------- normalization ---------- */

const KINDS: MemoryKind[] = ["feedback", "meeting", "decision", "competitor", "general"];

function inferKind(meta: Record<string, string>, docId: string | null, context: string | null): MemoryKind {
  const k = meta["kind"] as MemoryKind | undefined;
  if (k && KINDS.includes(k)) return k;
  const fromDoc = docId?.split("-")[0] as MemoryKind | undefined;
  if (fromDoc && KINDS.includes(fromDoc)) return fromDoc;
  const fromCtx = context?.split(":")[0] as MemoryKind | undefined;
  if (fromCtx && KINDS.includes(fromCtx)) return fromCtx;
  return "general";
}

function stringMeta(m: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (m && typeof m === "object") {
    for (const [k, v] of Object.entries(m as Record<string, unknown>)) {
      if (v != null) out[k] = typeof v === "string" ? v : JSON.stringify(v);
    }
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: any): MemoryItem {
  const metadata = stringMeta(raw.metadata);
  const documentId = raw.document_id ?? null;
  const context = raw.context ?? null;
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    text: String(raw.text ?? ""),
    factType: raw.fact_type ?? raw.type ?? null,
    context,
    date: raw.occurred_start ?? raw.mentioned_at ?? raw.date ?? null,
    documentId,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    metadata,
    kind: inferKind(metadata, documentId, context),
  };
}

export function groupRecords(items: MemoryItem[]): MemoryRecord[] {
  const map = new Map<string, MemoryRecord>();
  for (const it of items) {
    if (!it.documentId) continue;
    const rec = map.get(it.documentId) ?? {
      documentId: it.documentId,
      kind: it.kind,
      metadata: {},
      facts: [],
      date: null,
    };
    rec.facts.push(it);
    if (Object.keys(it.metadata).length > Object.keys(rec.metadata).length) rec.metadata = it.metadata;
    if (rec.kind === "general" && it.kind !== "general") rec.kind = it.kind;
    map.set(it.documentId, rec);
  }
  for (const r of map.values()) r.date = r.metadata["date"] ?? r.facts[0]?.date?.slice(0, 10) ?? null;
  return [...map.values()].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function listMemories(opts: { limit?: number; type?: string } = {}) {
  await ensureBank();
  const res = await client().listMemories(config().bankId, {
    limit: opts.limit ?? 500,
    ...(opts.type ? { type: opts.type } : {}),
  });
  return { items: (res.items ?? []).map(normalize), total: res.total ?? 0 };
}

export async function recallMemories(query: string, types?: string[]) {
  await ensureBank();
  const res = await client().recall(config().bankId, query, {
    budget: "mid",
    maxTokens: 4096,
    ...(types && types.length ? { types } : {}),
  });
  return (res.results ?? []).map(normalize);
}

export async function reflectOnMemories(query: string) {
  await ensureBank();
  const res = await client().reflect(config().bankId, query, { budget: "mid", includeFacts: true });
  return {
    text: res.text ?? "",
    basedOn: (res.based_on?.memories ?? []).map(normalize),
  };
}

/* ---------- error mapping (never leaks secrets or stacks) ---------- */

export function toApiError(e: unknown): { status: number; body: ApiError } {
  if (e instanceof ConfigError) {
    return {
      status: 503,
      body: { code: "missing_key", error: "SHADOW needs a Hindsight Cloud API key to activate persistent memory." },
    };
  }
  const status = e instanceof HindsightError ? e.statusCode : undefined;
  if (status === 401 || status === 403) {
    return {
      status: 502,
      body: { code: "auth_failed", error: "Hindsight authentication failed. Check the HINDSIGHT_API_KEY secret." },
    };
  }
  console.error("[hindsight]", status ?? "", e instanceof Error ? e.message : "unknown error");
  return { status: 502, body: { code: "unreachable", error: "Could not reach Hindsight." } };
}
