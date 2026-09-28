import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display tracking-tight text-foreground", className)}>
      SHADOW<span className="text-primary">.</span>
    </span>
  );
}
