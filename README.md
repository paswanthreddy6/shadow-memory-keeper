# SHADOW — AI Product Memory

Make the signal impossible to lose.

## Problem
Product teams collect signal everywhere — calls, meetings, tickets, decisions, competitor notes — and lose the connections between them.

## Solution
SHADOW gives product teams persistent memory (Hindsight Cloud) so today's question can use yesterday's context.

## Features
- Capture customer feedback, meetings, decisions (with rationale), competitor observations
- AI Memory browser (list + semantic Recall, WORLD / EXPERIENCE / OBSERVATION filters)
- Ask SHADOW: grounded answers with Evidence and Related memories
- One-click fictional NovaCart demo (12 interconnected memories)

## Architecture
```text
Browser -> /api/* server routes (TanStack Start) -> src/services/hindsight.server.ts -> Hindsight Cloud
```
The browser never talks to Hindsight directly.

## Retain -> Recall -> Reflect
- Retain: `client.retain` / `retainBatch` with metadata, tags and document ids
- Recall: `client.recall` for semantic retrieval
- Reflect: `client.reflect` (with facts) for grounded synthesis

## Project structure
- `src/services/hindsight.server.ts` — ensureBank, retainMemory, recallMemories, reflectOnMemories, listMemories
- `src/routes/api/*` — HTTP endpoints
- `src/lib/memory-schemas.ts` — validation + natural-language memory builders
- `src/lib/demo-data.ts` — fictional NovaCart seed
- `src/components/shadow/*` — UI components; `src/routes/*` — pages
- `src/types/memory.ts` — API types

## Setup / Environment variables
```
HINDSIGHT_API_KEY=your_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=shadow-demo
```
Never commit real API keys. In Lovable, add them as project secrets.

## Demo
See `docs/DEMO_SCRIPT.md`.

## Security
The API key is read only inside server handlers, never returned, logged, or sent to the browser. Inputs are validated with Zod; errors are mapped to safe messages.

## API endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | /api/feedback | Retain customer feedback |
| POST | /api/meetings | Retain a meeting |
| POST | /api/decisions | Retain a decision |
| POST | /api/competitors | Retain a competitor observation |
| POST | /api/demo | Seed fictional NovaCart memories |
| POST | /api/chat | Recall + Reflect grounded answer |
| GET | /api/memories?q=&type= | List (or recall when q given) |
| GET | /api/health | Configuration status (no secrets) |
