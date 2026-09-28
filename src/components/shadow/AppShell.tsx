import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Brain,
  Gavel,
  LayoutDashboard,
  Menu,
  MessageSquareQuote,
  Sparkles,
  Swords,
  Users,
  X,
} from "lucide-react";
import { Wordmark } from "./Wordmark";
import { healthQuery } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/feedback", label: "Customer Feedback", icon: MessageSquareQuote },
  { to: "/meetings", label: "Meetings", icon: Users },
  { to: "/decisions", label: "Product Decisions", icon: Gavel },
  { to: "/competitors", label: "Competitors", icon: Swords },
  { to: "/memory", label: "AI Memory", icon: Brain },
  { to: "/ask", label: "Ask SHADOW", icon: Sparkles },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", active && "text-primary")} />
            {label}
            {to === "/ask" && (
              <span className="ml-auto rounded bg-primary/15 px-1.5 font-mono text-[10px] text-primary">AI</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Status() {
  const { data, isError } = useQuery(healthQuery);
  const ok = data?.hindsightConfigured && !isError;
  return (
    <div className="rounded-lg border border-border p-3 text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className={cn("size-1.5 rounded-full", ok ? "bg-kind-meeting pulse-dot" : "bg-destructive")} />
        {data ? (ok ? "Memory online" : "Memory offline") : "Checking memory…"}
      </div>
      {data && <div className="mt-1 font-mono text-[10px] text-muted-foreground/70">bank · {data.bankId}</div>}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background grain">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/80 p-4 backdrop-blur lg:flex">
        <Link to="/" className="mb-1 px-3 pt-2">
          <Wordmark className="text-3xl" />
        </Link>
        <p className="mb-8 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          AI Product Memory
        </p>
        <NavLinks />
        <div className="mt-auto">
          <Status />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur lg:hidden">
        <Link to="/">
          <Wordmark className="text-2xl" />
        </Link>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-14 z-20 border-b border-border bg-background p-4 lg:hidden">
          <NavLinks onNavigate={() => setOpen(false)} />
          <div className="mt-4">
            <Status />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl leading-none text-foreground sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
