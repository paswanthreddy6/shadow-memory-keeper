export type MemoryKind = "feedback" | "meeting" | "decision" | "competitor" | "general";

export const KIND_LABEL: Record<MemoryKind, string> = {
  feedback: "Customer Feedback",
  meeting: "Meeting",
  decision: "Product Decision",
  competitor: "Competitor Observation",
  general: "General Product Memory",
};

/** A single fact/memory unit as returned by Hindsight (normalized). */
export interface MemoryItem {
  id: string;
  text: string;
  factType: string | null; // world | experience | observation
  context: string | null;
  date: string | null;
  documentId: string | null;
  tags: string[];
  metadata: Record<string, string>;
  kind: MemoryKind;
}

/** A retained source record (one retain call), reassembled from its facts. */
export interface MemoryRecord {
  documentId: string;
  kind: MemoryKind;
  metadata: Record<string, string>;
  facts: MemoryItem[];
  date: string | null;
}

export interface MemoriesResponse {
  items: MemoryItem[];
  records: MemoryRecord[];
  total: number;
  mode: "list" | "recall";
}

export interface ChatResponse {
  answer: string;
  memories: MemoryItem[];
  sources: MemoryItem[];
  insufficient: boolean;
}

export interface RetainResult {
  success: true;
  message: string;
  memory: { documentId: string; kind: MemoryKind; content: string; metadata: Record<string, string> };
}

export interface ApiError {
  error: string;
  code: "missing_key" | "auth_failed" | "unreachable" | "invalid_input" | "unknown";
}

export interface HealthResponse {
  ok: boolean;
  hindsightConfigured: boolean;
  bankId: string;
}
