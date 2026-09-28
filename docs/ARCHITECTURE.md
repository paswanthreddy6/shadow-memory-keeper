# Architecture
```text
USER -> SHADOW FRONTEND -> SECURE BACKEND (/api/*) -> HINDSIGHT -> PERSISTENT MEMORY
QUESTION -> /api/chat -> RECALL -> relevant memories -> REFLECT -> grounded answer + evidence
```
- Each capture becomes one Hindsight document (id `kind-uuid`) with metadata and tags (`kind:*`, `area:*`).
- Pages list records by grouping extracted facts by document id.
- `ensureBank()` creates/updates the bank with SHADOW's mission on first use.
- If Recall returns nothing, /api/chat answers "insufficient evidence" instead of guessing.
