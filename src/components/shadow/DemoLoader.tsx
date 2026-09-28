import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

const STEPS = ["Retaining memories...", "Building product context...", "Memory bank updated.", "SHADOW is ready."];

export function DemoLoader({ compact }: { compact?: boolean }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(-1);
  const running = step >= 0 && step < 3;

  useEffect(() => {
    if (step !== 1) return;
    // Hindsight extracts facts asynchronously — poll until the bank has memories.
    let tries = 0;
    let cancelled = false;
    const tick = async () => {
      tries++;
      try {
        const res = await api.memories();
        if (cancelled) return;
        if (res.records.filter((r) => r.metadata["demo"] === "true").length >= 6 || tries > 40) {
          qc.setQueryData(["memories"], res);
          setStep(2);
          setTimeout(() => setStep(3), 900);
          toast.success("Demo memory loaded.");
          return;
        }
      } catch {
        /* keep polling */
      }
      if (!cancelled) setTimeout(tick, 3000);
    };
    const t = setTimeout(tick, 2500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [step, qc]);

  async function load() {
    setStep(0);
    try {
      await api.demo();
      setStep(1);
    } catch (e) {
      setStep(-1);
      toast.error(e instanceof Error ? e.message : "Could not reach Hindsight.");
    }
  }

  return (
    <div className={compact ? "" : "rounded-xl border border-border bg-card/60 p-5"}>
      <Button onClick={load} disabled={running} variant="outline" className="gap-2">
        {running ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4" />}
        {running ? "Loading demo..." : "Load Demo Memory"}
      </Button>
      {!compact && step < 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Seeds 12 interconnected, fictional memories for “NovaCart” — a checkout story.
        </p>
      )}
      {step >= 0 && (
        <ol className="mt-4 space-y-1.5 font-mono text-xs">
          {STEPS.map((s, i) => (
            <li key={s} className={i <= step ? "text-foreground" : "text-muted-foreground/40"}>
              <span className="inline-flex w-5">
                {i < step || step === 3 ? (
                  <Check className="size-3 text-primary" />
                ) : i === step ? (
                  <Loader2 className="size-3 animate-spin text-primary" />
                ) : null}
              </span>
              {s}
            </li>
          ))}
        </ol>
      )}
      {step === 3 && (
        <Link to="/ask" className="mt-3 inline-block text-sm text-primary hover:underline">
          Ask SHADOW a question →
        </Link>
      )}
    </div>
  );
}
