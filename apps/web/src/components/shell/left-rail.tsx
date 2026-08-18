"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Calendar, ChevronLeft, Package, Settings2, Tags } from "lucide-react";
import { cn } from "@/lib/cn";
import { seedGradient } from "@/lib/seed-gradient";
import { MODULES, moduleFromPathname } from "@/modules/registry";
import { GROUPS_YOURS } from "@/modules/mock-data";

const RAIL_COLLAPSED_KEY = "bridge-rail-collapsed";

/**
 * Desktop left rail — the same nine modules in the same order as the mobile
 * strip, plus Your groups and shortcuts. Collapsible to an icon strip via
 * the pinned control at the bottom (persisted in localStorage). Below
 * 1080px it collapses automatically so the right context panel keeps its
 * room; the manual toggle is hidden while the auto-collapse is in force.
 */
export function LeftRail(): React.JSX.Element {
  const pathname = usePathname();
  const active = moduleFromPathname(pathname);
  const [userCollapsed, setUserCollapsed] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);

  React.useEffect(() => {
    setUserCollapsed(window.localStorage.getItem(RAIL_COLLAPSED_KEY) === "1");
    const media = window.matchMedia("(max-width: 1080px)");
    const update = (): void => {
      setNarrow(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  const collapsed = userCollapsed || narrow;

  function toggle(): void {
    setUserCollapsed((prev) => {
      window.localStorage.setItem(RAIL_COLLAPSED_KEY, prev ? "0" : "1");
      return !prev;
    });
  }

  return (
    <div
      className={cn(
        "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-r bg-card lg:flex",
        collapsed ? "w-12" : "w-56",
      )}
    >
      <div className={cn("no-scrollbar flex-1 overflow-y-auto", collapsed ? "p-[5px]" : "p-2.5")}>
        <nav className="flex flex-col gap-0.5" aria-label="Modules">
          {MODULES.map((mod) => {
            const isActive = active?.id === mod.id;
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                href={mod.href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? mod.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted",
                  isActive && cn(mod.color.soft, mod.color.text, "font-semibold"),
                  collapsed && "justify-center px-0",
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
                {!collapsed && mod.label}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <>
            <RailHeading>Your groups</RailHeading>
            {GROUPS_YOURS.map((g) => (
              <Link key={g.id} href="/groups" className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm hover:bg-muted">
                <span className="size-[18px] shrink-0 rounded-md" style={seedGradient(g.name)} />
                <span className="truncate">{g.name}</span>
              </Link>
            ))}

            <RailHeading>Shortcuts</RailHeading>
            <RailShortcut icon={Bookmark} label="Saved" />
            <RailShortcut icon={Tags} label="My listings" />
            <RailShortcut icon={Package} label="Orders" />
            <RailShortcut icon={Calendar} label="Events" />
            <RailShortcut icon={Settings2} label="Reorder / hide modules" />
          </>
        )}
      </div>

      {!narrow && (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex items-center gap-2 border-t px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} strokeWidth={1.8} />
          {!collapsed && "Collapse"}
        </button>
      )}
    </div>
  );
}

function RailHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <h4 className="px-3 pb-1.5 pt-5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h4>
  );
}

function RailShortcut({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string }): React.JSX.Element {
  return (
    <button type="button" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm hover:bg-muted">
      <Icon className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
      <span className="truncate">{label}</span>
    </button>
  );
}
