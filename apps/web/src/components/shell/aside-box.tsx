"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { seedGradient } from "@/lib/seed-gradient";

/** Right-panel context box — individually collapsible by clicking its header. */
export function AsideBox({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  const [closed, setClosed] = React.useState(false);
  return (
    <section className="mb-3 rounded-lg border bg-card p-3">
      <button
        type="button"
        onClick={() => { setClosed((c) => !c); }}
        className="flex w-full items-center justify-between text-left text-xs font-semibold"
        aria-expanded={!closed}
      >
        {title}
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", closed && "-rotate-90")} />
      </button>
      {!closed && <div className="mt-2">{children}</div>}
    </section>
  );
}

/** Small row inside an aside box: square glyph + text (+ optional subtext). */
export function AsideRow({ seed, title, sub }: { seed?: string; title: React.ReactNode; sub?: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5 border-t py-2 text-xs first:border-t-0 first:pt-0 last:pb-0">
      <span className="size-7 shrink-0 rounded-lg bg-muted" style={seed ? seedGradient(seed) : undefined} />
      <div className="min-w-0">
        <div className="truncate font-medium">{title}</div>
        {sub && <div className="truncate text-[11px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}
