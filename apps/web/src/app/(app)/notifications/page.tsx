import type { JSX } from "react";
import type { Metadata } from "next";
import { ModulePage } from "@/components/shell/module-page";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { NOTIFICATIONS } from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Notifications" };

/**
 * Notifications are universal — one list across modules, each item labelled
 * with its module; unread tinted (BRIDGE-brief §7).
 */
export default function NotificationsPage(): JSX.Element {
  return (
    <ModulePage
      aside={
        <AsideBox title="Settings">
          <AsideRow seed="push" title="Push per module" sub="Dating & Jobs only" />
          <AsideRow seed="quiet" title="Quiet hours" sub="22:00 – 07:00" />
        </AsideBox>
      }
    >
      <h1 className="mb-1 font-display text-lg font-bold">Notifications</h1>
      <p className="mb-3 text-xs text-muted-foreground">All modules</p>

      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto">
        {["All", "Unread", "Marketplace", "Dating", "Jobs", "Groups"].map((chip, i) => (
          <span
            key={chip}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs",
              i === 0 ? "border-foreground bg-foreground text-card" : "bg-card",
            )}
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.text}
            className={cn("flex items-start gap-3 border-b p-3 last:border-b-0", n.unread && "bg-accent-soft/60")}
          >
            <span className="size-8 shrink-0 rounded-full" style={seedGradient(n.text)} />
            <div className="min-w-0 flex-1 text-sm">
              {n.text}
              <div className="text-xs text-muted-foreground">{n.meta}</div>
            </div>
            {n.unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-gold" />}
          </div>
        ))}
      </div>
    </ModulePage>
  );
}
