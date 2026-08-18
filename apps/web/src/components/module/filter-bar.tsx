"use client";

import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FILTERS } from "@/modules/filters";
import type { ModuleId } from "@/modules/registry";

/**
 * Per-module filter bar (BRIDGE-brief §3): a Filters button + 2–4 quick
 * chips, chosen per module. Posts/Reels get only a 1:1 segmented
 * Following/For-you toggle. The Filters button opens a bottom sheet on
 * mobile and an inline panel on desktop. UI-state only for now — filter
 * values don't query anything yet.
 */
export function FilterBar({ module, dark }: { module: ModuleId; dark?: boolean }): React.JSX.Element {
  const config = FILTERS[module];
  const [activeQuick, setActiveQuick] = React.useState(config.defaultQuick);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  if (config.segmented) {
    return (
      <div className="mb-3 flex gap-1.5" role="tablist" aria-label={`${module} feed`}>
        {config.quick.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={i === activeQuick}
            onClick={() => { setActiveQuick(i); }}
            className={cn(
              "flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              i === activeQuick
                ? "border-foreground bg-foreground text-card"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
              dark && i !== activeQuick && "border-card/20 bg-card/10 text-card/70 hover:text-card",
              dark && i === activeQuick && "border-card bg-card text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="no-scrollbar mb-3 flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setSheetOpen(true); }}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-foreground bg-card px-3 py-1.5 text-sm font-semibold"
        >
          <SlidersHorizontal className="size-3.5" strokeWidth={2} />
          Filters
        </button>
        {config.quick.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={i === activeQuick}
            onClick={() => { setActiveQuick(i); }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
              i === activeQuick
                ? "border-foreground bg-foreground text-card"
                : "border-border bg-card text-foreground/80 hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${config.quick[activeQuick] ?? ""} filters`}>
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-foreground/35" onClick={() => { setSheetOpen(false); }} />
          {/* Bottom sheet on mobile, centered panel on desktop */}
          <div className="absolute inset-x-0 bottom-0 flex max-h-[82%] flex-col rounded-t-3xl bg-card p-4 pb-0 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-96 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-border sm:hidden" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Filters</h2>
              <button type="button" className="rounded-md p-1.5 hover:bg-muted" aria-label="Close" onClick={() => { setSheetOpen(false); }}>
                <X className="size-4" strokeWidth={1.8} />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{config.scopeNote}</p>
            <div className="no-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto pb-3">
              {config.groups.map((group) => (
                <div key={group.label} className="mb-4">
                  <div className="mb-1.5 text-xs font-semibold">{group.label}</div>
                  {group.options === "range" ? (
                    <div>
                      <div className="relative mx-1 my-3 h-1 rounded-full bg-muted">
                        <div className="absolute inset-y-0 left-[20%] right-[35%] rounded-full bg-accent" />
                        <span className="absolute -top-1.5 left-[20%] size-4 -translate-x-1/2 rounded-full border-2 border-accent bg-card" />
                        <span className="absolute -top-1.5 right-[35%] size-4 translate-x-1/2 rounded-full border-2 border-accent bg-card" />
                      </div>
                      <div className="text-[11px] text-muted-foreground">{group.rangeHint}</div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {group.options.map((option) => (
                        <FilterOptionChip key={option} label={option} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t bg-card py-3">
              <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => { setSheetOpen(false); }}>
                Clear
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-foreground py-2 text-sm font-semibold text-card"
                onClick={() => { setSheetOpen(false); }}
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterOptionChip({ label }: { label: string }): React.JSX.Element {
  const [on, setOn] = React.useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => { setOn((v) => !v); }}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs transition-colors",
        on ? "border-foreground bg-foreground text-card" : "border-border bg-card hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
