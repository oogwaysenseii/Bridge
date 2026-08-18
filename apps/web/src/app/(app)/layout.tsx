import type { ReactNode, JSX } from "react";
import { TopBar } from "@/components/shell/top-bar";
import { ModuleStrip } from "@/components/shell/module-strip";
import { BottomBar } from "@/components/shell/bottom-bar";
import { LeftRail } from "@/components/shell/left-rail";

/**
 * The one shell that never changes (BRIDGE-brief §2): top bar + module strip
 * (mobile) + bottom bar (mobile) + left rail (desktop). Only the center —
 * `children` — swaps by module or global screen.
 */
export default function AppLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="min-h-dvh">
      <TopBar />
      <ModuleStrip />
      <div className="flex w-full">
        <LeftRail />
        <main className="min-w-0 flex-1 pb-24 lg:pb-8">{children}</main>
      </div>
      <BottomBar />
    </div>
  );
}
