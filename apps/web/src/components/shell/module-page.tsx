import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Standard module page frame: fluid center column + optional right context
 * panel on desktop (BRIDGE-brief §2 — every module is a page + a right-panel
 * context; the right panel is context, not ads).
 *
 * The panel is sticky while the center content scrolls, and only spans the
 * center content: anything passed to `below` renders after both columns at
 * full width (e.g. "Similar nearby" on the product page).
 */
export function ModulePage({
  children,
  aside,
  below,
  dark,
}: {
  children: ReactNode;
  aside?: ReactNode;
  /** Full-width section rendered below the center+panel columns. */
  below?: ReactNode;
  /** Reels & Dating render on a dark surface. */
  dark?: boolean;
}): JSX.Element {
  return (
    <div className={cn(dark && "dark bg-background text-foreground")}>
      {/* Fluid center: the content claims whatever width the rails leave free
          (collapsing the left rail widens the page instead of the margins). */}
      <div className="flex w-full gap-6 px-4 py-4 lg:px-6">
        <div className="min-w-0 flex-1">{children}</div>
        {/* Context panel stays up on all desktop widths; below 1080px the
            left rail auto-collapses (see LeftRail) to make room for it. */}
        {aside && (
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-[4.5rem]">{aside}</div>
          </aside>
        )}
      </div>
      {below && <div className="w-full px-4 pb-4 lg:px-6">{below}</div>}
    </div>
  );
}
