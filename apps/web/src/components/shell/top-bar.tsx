"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Menu, MessageCircle, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { seedGradient } from "@/lib/seed-gradient";
import { totalUnread, CURRENT_USER, GROUPS_YOURS } from "@/modules/mock-data";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

/**
 * The global chrome (BRIDGE-brief §2): the same four globals everywhere —
 * Home · Messages · Notifications · Profile — plus universal search and
 * Create. On mobile the four globals live in the bottom bar instead; the
 * top bar keeps ☰ (drawer), logo and search.
 */
export function TopBar(): React.JSX.Element {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const unread = totalUnread();

  // Close the drawer on any navigation.
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const globals = [
    { href: "/feed", label: "Home", icon: Home, active: !["/messages", "/notifications", "/profile", "/search"].some((p) => pathname.startsWith(p)) },
    { href: "/messages/market", label: "Messages", icon: MessageCircle, active: pathname.startsWith("/messages"), badge: unread },
    { href: "/notifications", label: "Notifications", icon: Bell, active: pathname.startsWith("/notifications"), dot: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="flex h-14 w-full items-center gap-3 px-4 lg:px-6">
          <button
            type="button"
            className="rounded-md p-2 hover:bg-muted lg:hidden"
            aria-label="Open menu"
            onClick={() => { setDrawerOpen(true); }}
          >
            <Menu className="size-5" strokeWidth={1.8} />
          </button>

          <Logo />

          {/* Universal search — one query, results grouped per module. */}
          <Link
            href="/search"
            className="ml-4 hidden h-9 flex-1 items-center gap-2 rounded-full bg-background px-4 text-sm text-muted-foreground transition-colors hover:bg-muted lg:flex lg:max-w-md"
          >
            <Search className="size-4" strokeWidth={1.8} />
            Search people, listings, groups, jobs, courses…
          </Link>

          <div className="flex-1 lg:hidden" />

          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-card transition-opacity hover:opacity-90 lg:inline-flex"
          >
            <Plus className="size-4" strokeWidth={2.2} />
            Create
          </button>

          <Link href="/search" className="rounded-md p-2 hover:bg-muted lg:hidden" aria-label="Search">
            <Search className="size-5" strokeWidth={1.8} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Global">
            {globals.map(({ href, label, icon: Icon, active, badge, dot }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className={cn(
                  "relative rounded-lg p-2.5 transition-colors hover:bg-muted",
                  active && "bg-accent-soft text-accent",
                )}
              >
                <Icon className="size-5" strokeWidth={1.8} />
                {badge ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-card bg-gold px-1 font-mono text-[9px] font-medium text-gold-foreground">
                    {badge}
                  </span>
                ) : dot ? (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-card bg-gold" />
                ) : null}
              </Link>
            ))}
            <ThemeToggle />
            <Link
              href="/profile"
              aria-label="Profile"
              className={cn(
                "ml-1 rounded-full p-0.5 transition-shadow",
                pathname.startsWith("/profile") && "ring-2 ring-accent",
              )}
            >
              <span
                className="block size-8 rounded-full"
                style={seedGradient(CURRENT_USER.name)}
              />
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/35"
            onClick={() => { setDrawerOpen(false); }}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col overflow-y-auto bg-card p-4 shadow-xl">
            <div className="flex items-center gap-3 border-b pb-4">
              <span className="block size-10 rounded-full" style={seedGradient(CURRENT_USER.name)} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{CURRENT_USER.name}</div>
                <div className="text-xs text-muted-foreground">
                  {CURRENT_USER.handle} · {CURRENT_USER.town}
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-2 hover:bg-muted"
                aria-label="Close menu"
                onClick={() => { setDrawerOpen(false); }}
              >
                <X className="size-5" strokeWidth={1.8} />
              </button>
            </div>

            <nav className="flex flex-col gap-0.5 py-3 text-sm font-medium">
              <DrawerLink href="/feed" label="Home" />
              <DrawerLink href="#" label="Saved" />
              <DrawerLink href="#" label="My listings" />
              <DrawerLink href="#" label="Orders" />
              <DrawerLink href="#" label="Events" />
            </nav>

            <DrawerHeading>Your groups</DrawerHeading>
            {GROUPS_YOURS.map((g) => (
              <div key={g.id} className="flex items-center gap-2.5 px-2 py-1.5 text-sm">
                <span className="size-5 rounded-md" style={seedGradient(g.name)} />
                {g.name}
              </div>
            ))}

            <DrawerHeading>Modules</DrawerHeading>
            <DrawerLink href="#" label="Reorder / hide modules" />

            <div className="mt-auto border-t pt-3">
              <ThemeToggle withLabel />
              <DrawerLink href="#" label="Settings" />
              <DrawerLink href="/login" label="Sign in" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DrawerHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <h4 className="px-2 pb-1.5 pt-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h4>
  );
}

function DrawerLink({ href, label }: { href: string; label: string }): React.JSX.Element {
  return (
    <Link href={href} className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-muted">
      {label}
    </Link>
  );
}
