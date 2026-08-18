"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { MODULES, moduleFromPathname } from "@/modules/registry";
import { unreadCount } from "@/modules/mock-data";

/**
 * The module strip — the core interaction of the whole app is switching
 * modules fast (BRIDGE-brief §2). Tab/URL-based (the swipe pager from the
 * mock was dropped for now). Shown on mobile under the top bar; on module
 * pages it links to /{module}, inside Messages and Profile it re-scopes the
 * same screen (/messages/{module}, /profile/{module}) and — for Messages —
 * shows per-module unread counts. Hidden on universal screens
 * (notifications, search).
 */
export function ModuleStrip(): React.JSX.Element | null {
  const pathname = usePathname();
  const active = moduleFromPathname(pathname);
  const activeRef = React.useRef<HTMLAnchorElement>(null);

  const section = pathname.startsWith("/messages")
    ? "messages"
    : pathname.startsWith("/profile")
      ? "profile"
      : "home";

  const hidden = pathname.startsWith("/notifications") || pathname.startsWith("/search");

  // Auto-center the active tab.
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  if (hidden) return null;

  return (
    <nav
      aria-label="Modules"
      className="no-scrollbar sticky top-14 z-30 flex gap-5 overflow-x-auto border-b bg-card px-4 lg:hidden"
    >
      {MODULES.map((mod) => {
        const href =
          section === "messages" ? `/messages/${mod.id}` : section === "profile" ? `/profile/${mod.id}` : mod.href;
        const isActive = active?.id === mod.id;
        const unread = section === "messages" ? unreadCount(mod.id) : 0;
        return (
          <Link
            key={mod.id}
            href={href}
            ref={isActive ? activeRef : null}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 border-transparent py-2.5 text-sm text-muted-foreground",
              isActive && cn(mod.color.border, mod.color.text, "font-semibold"),
            )}
          >
            {mod.label}
            {unread > 0 && (
              <span className="rounded-md bg-gold px-1 font-mono text-[9px] font-medium text-gold-foreground">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
