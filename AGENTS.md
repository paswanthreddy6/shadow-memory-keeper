<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All Hindsight calls live in `src/services/hindsight.server.ts`, used only from `/api/*` route handlers — keeps the API key server-side.
- Hindsight is the only memory store; each capture is one document id `kind-uuid` with metadata — pages regroup facts by document id.
