import { z } from "zod";
import type { MemoryKind } from "@/types/memory";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const short = (max = 200) => z.string().trim().min(1).max(max);
const opt = (max = 200) => z.string().trim().max(max).default("");

export const feedbackSchema = z.object({
  title: short(),
  customer: short(),
  feedback: short(5000),
  productArea: short(80),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  date,
});
export const meetingSchema = z.object({
  title: short(),
  date,
  participants: short(500),
  notes: short(8000),
  productArea: short(80),
});
export const decisionSchema = z.object({
  title: short(),
  decision: short(3000),
  rationale: short(3000),
  alternatives: opt(3000),
  productArea: short(80),
  date,
  status: z.enum(["Proposed", "Approved", "Postponed", "Rejected", "Shipped"]),
});
export const competitorSchema = z.object({
  competitor: short(),
  observation: short(5000),
  productArea: short(80),
  date,
  source: opt(300),
});
export const chatSchema = z.object({ message: short(2000) });

export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type MeetingInput = z.infer<typeof meetingSchema>;
export type DecisionInput = z.infer<typeof decisionSchema>;
export type CompetitorInput = z.infer<typeof competitorSchema>;

export interface MemoryDraft {
  kind: MemoryKind;
  content: string;
  date: string;
  metadata: Record<string, string>;
  tags: string[];
}

const areaTag = (a: string) => `area:${a.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function feedbackToMemory(i: FeedbackInput): MemoryDraft {
  return {
    kind: "feedback",
    date: i.date,
    content: `Customer feedback from ${i.customer}: ${i.title}.\n${i.feedback}\nProduct area: ${i.productArea}.\nPriority: ${i.priority}.\nDate: ${i.date}.`,
    metadata: { kind: "feedback", title: i.title, customer: i.customer, productArea: i.productArea, priority: i.priority, date: i.date },
    tags: ["kind:feedback", areaTag(i.productArea)],
  };
}
export function meetingToMemory(i: MeetingInput): MemoryDraft {
  return {
    kind: "meeting",
    date: i.date,
    content: `Product team meeting: ${i.title}.\nDate: ${i.date}.\nParticipants: ${i.participants}.\nProduct area: ${i.productArea}.\nMeeting notes:\n${i.notes}`,
    metadata: { kind: "meeting", title: i.title, participants: i.participants, productArea: i.productArea, date: i.date, notes: i.notes.slice(0, 1500) },
    tags: ["kind:meeting", areaTag(i.productArea)],
  };
}
export function decisionToMemory(i: DecisionInput): MemoryDraft {
  return {
    kind: "decision",
    date: i.date,
    content: `Product decision: ${i.title}.\nDecision: ${i.decision}\nStatus: ${i.status}.\nReason / rationale: ${i.rationale}${i.alternatives ? `\nAlternatives considered: ${i.alternatives}` : ""}\nProduct area: ${i.productArea}.\nDate: ${i.date}.`,
    metadata: { kind: "decision", title: i.title, decision: i.decision.slice(0, 1500), rationale: i.rationale.slice(0, 1500), alternatives: i.alternatives.slice(0, 1000), status: i.status, productArea: i.productArea, date: i.date },
    tags: ["kind:decision", areaTag(i.productArea)],
  };
}
export function competitorToMemory(i: CompetitorInput): MemoryDraft {
  return {
    kind: "competitor",
    date: i.date,
    content: `Competitor observation about ${i.competitor}:\n${i.observation}\nProduct area: ${i.productArea}.${i.source ? `\nSource: ${i.source}.` : ""}\nDate: ${i.date}.`,
    metadata: { kind: "competitor", title: i.competitor, competitor: i.competitor, observation: i.observation.slice(0, 1500), productArea: i.productArea, source: i.source, date: i.date },
    tags: ["kind:competitor", areaTag(i.productArea)],
  };
}
