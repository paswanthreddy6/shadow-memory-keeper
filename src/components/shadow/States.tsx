import { KeyRound, Inbox, WifiOff } from "lucide-react";
import { ShadowApiError } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

export function ErrorState({ error }: { error: unknown }) {
  const e = error instanceof ShadowApiError ? error : null;
  const Icon = e?.code === "missing_key" || e?.code === "auth_failed" ? KeyRound : WifiOff;
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 text-destructive" />
        <div>
          <p className="font-medium text-foreground">{e?.message ?? "Could not reach Hindsight."}</p>
          {e?.code === "missing_key" && (
            <p className="mt-1 text-muted-foreground">Add the HINDSIGHT_API_KEY secret to switch memory on.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <Inbox className="mb-3 size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {message ?? "No memories yet. Capture your first product signal or load the demo."}
      </p>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-muted-foreground">Loading memories…</p>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}
