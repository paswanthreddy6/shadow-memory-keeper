import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type Field =
  | { name: string; label: string; type: "text" | "date"; placeholder?: string; required?: boolean }
  | { name: string; label: string; type: "textarea"; placeholder?: string; required?: boolean; rows?: number }
  | { name: string; label: string; type: "select"; options: string[] };

const today = () => new Date().toISOString().slice(0, 10);

export function CaptureDialog({
  endpoint,
  title,
  description,
  trigger,
  fields,
  successMessage,
}: {
  endpoint: "feedback" | "meetings" | "decisions" | "competitors";
  title: string;
  description: string;
  trigger: string;
  fields: Field[];
  successMessage: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const init = () =>
    Object.fromEntries(
      fields.map((f) => [f.name, f.type === "date" ? today() : f.type === "select" ? f.options[0] : ""]),
    );
  const [values, setValues] = useState<Record<string, string>>(init);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.retain(endpoint, values);
      toast.success(successMessage);
      setOpen(false);
      setValues(init());
      // Hindsight indexes facts shortly after retain; refresh now and again shortly.
      qc.invalidateQueries({ queryKey: ["memories"] });
      setTimeout(() => qc.invalidateQueries({ queryKey: ["memories"] }), 4000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reach Hindsight.");
    } finally {
      setBusy(false);
    }
  }

  const control = (f: Field): ReactNode => {
    const common = {
      id: f.name,
      value: values[f.name] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setValues((v) => ({ ...v, [f.name]: e.target.value })),
    };
    if (f.type === "textarea")
      return <Textarea {...common} rows={f.rows ?? 4} placeholder={f.placeholder} required={f.required !== false} />;
    if (f.type === "select")
      return (
        <select
          {...common}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {f.options.map((o) => (
            <option key={o} value={o} className="bg-popover">
              {o}
            </option>
          ))}
        </select>
      );
    return <Input {...common} type={f.type} placeholder={f.placeholder} required={f.required !== false} />;
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="size-4" /> {trigger}
      </Button>
      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name} className="text-xs text-muted-foreground">
                  {f.label}
                </Label>
                {control(f)}
              </div>
            ))}
            <Button type="submit" disabled={busy} className="w-full gap-2">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Retaining..." : "Retain memory"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const AREAS = ["Checkout", "Onboarding", "Payments", "Search", "Pricing", "Mobile", "Platform", "Other"];
