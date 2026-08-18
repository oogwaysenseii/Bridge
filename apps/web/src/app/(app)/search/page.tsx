import type { JSX } from "react";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ModulePage } from "@/components/shell/module-page";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { MODULES } from "@/modules/registry";
import { SEARCH_GROUPS, SEARCH_QUERY } from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Search" };

/**
 * Universal search (BRIDGE-brief §7): one query, results grouped per module
 * with the same kind tags used in feeds; inherits Marketplace scope by
 * default. Static sample results for now.
 */
export default function SearchPage(): JSX.Element {
  return (
    <ModulePage
      aside={
        <>
          <AsideBox title="Scope">
            <AsideRow seed="scope" title="Near me" sub="Follows your Marketplace scope · change radius" />
          </AsideBox>
          <AsideBox title="Saved searches">
            <AsideRow seed="oak table" title="oak table" sub="Marketplace · near me" />
            <AsideRow seed="bike mechanic" title="bike mechanic" sub="Jobs · Slovakia" />
          </AsideBox>
        </>
      }
    >
      <div className="mb-3 flex h-10 items-center gap-2.5 rounded-full bg-card px-4 text-sm shadow-sm">
        <Search className="size-4 text-muted-foreground" strokeWidth={1.8} />
        <b>{SEARCH_QUERY}</b>
        <span className="ml-auto text-xs text-muted-foreground">Near me</span>
      </div>

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        <span className="shrink-0 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs text-card">
          All modules
        </span>
        {MODULES.map((m) => (
          <span key={m.id} className="shrink-0 rounded-full border bg-card px-3 py-1 text-xs">
            {m.label}
          </span>
        ))}
      </div>

      <div className="gap-x-6 lg:columns-2">
        {SEARCH_GROUPS.map((group) => (
          <section key={group.label} className="mb-4 break-inside-avoid">
            <h2 className="mb-1 flex items-baseline justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
              {group.label}
              <span className="font-sans text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                {group.results.length} · see all
              </span>
            </h2>
            <div className="rounded-lg border bg-card px-3">
              {group.results.map((result) => (
                <div key={result.title} className="flex items-center gap-2.5 border-b py-2.5 text-sm last:border-b-0">
                  <span
                    className={cn("size-8 shrink-0 rounded-lg", group.module === "posts" && "rounded-full")}
                    style={seedGradient(result.title)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{result.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{result.detail}</div>
                  </div>
                  <span className={cn("shrink-0 font-mono text-[10px]", result.global ? "text-accent" : "text-muted-foreground")}>
                    {result.distance}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ModulePage>
  );
}
