"use client";
import type { JSX } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, MessageCircle, Plus, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { totalUnread } from "@/modules/mock-data";

/**
 * Mobile bottom bar — fixed, icons only: Home · Messages · + Create (raised)
 * · Notifications · Profile. Messages carries the total unread across all
 * module inboxes; per-module counts live in the module strip inside
 * Messages.
 */
export function BottomBar(): JSX.Element {
  const pathname = usePathname();
  const unread = totalUnread();

  const isHome = !["/messages", "/notifications", "/profile", "/search"].some((p) => pathname.startsWith(p));

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <BarLink href="/feed" label="Home" active={isHome}>
        <Home className="size-6" strokeWidth={1.8} />
      </BarLink>
      <BarLink href="/messages/market" label="Messages" active={pathname.startsWith("/messages")}>
        <MessageCircle className="size-6" strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-card bg-gold px-1 font-mono text-[9px] font-medium text-gold-foreground">
            {unread}
          </span>
        )}
      </BarLink>
      <button
        type="button"
        aria-label="Create"
        className="-mt-6 flex size-12 items-center justify-center rounded-2xl bg-foreground text-card shadow-lg shadow-foreground/25"
      >
        <Plus className="size-6" strokeWidth={2.2} />
      </button>
      <BarLink href="/notifications" label="Notifications" active={pathname.startsWith("/notifications")}>
        <Bell className="size-6" strokeWidth={1.8} />
        <span className="absolute right-0 top-0 size-2 rounded-full border-2 border-card bg-gold" />
      </BarLink>
      <BarLink href="/profile" label="Profile" active={pathname.startsWith("/profile")}>
        <User className="size-6" strokeWidth={1.8} />
      </BarLink>
    </nav>
  );
}

function BarLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn("relative rounded-lg p-2 text-muted-foreground", active && "text-accent")}
    >
      {children}
    </Link>
  );
}
