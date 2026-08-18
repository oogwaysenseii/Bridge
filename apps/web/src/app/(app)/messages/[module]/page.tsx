import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModulePage } from "@/components/shell/module-page";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { KindTag } from "@/components/module/cards";
import { MODULES, getModule, isModuleId } from "@/modules/registry";
import { MESSAGES, unreadCount } from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";
import { cn } from "@/lib/cn";

interface Props {
  params: Promise<{ module: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module } = await params;
  const mod = getModule(module);
  return { title: mod ? `Messages · ${mod.label}` : "Messages" };
}

/**
 * Messages are per module (BRIDGE-brief §7) because almost every module has
 * its own profile — a Marketplace thread carries the listing + price, Dating
 * shows matches, Jobs shows recruiter threads. The module strip (mobile) and
 * the tab row here (desktop) re-scope the inbox and show per-module unread
 * counts; the bottom-bar badge shows the total.
 */
export default async function MessagesPage({ params }: Props): Promise<JSX.Element> {
  const { module } = await params;
  if (!isModuleId(module)) notFound();
  const mod = getModule(module);
  if (!mod) notFound();
  const threads = MESSAGES[module];

  return (
    <ModulePage
      aside={
        <AsideBox title="Other inboxes">
          {MODULES.filter((m) => m.id !== module).map((m) => (
            <AsideRow key={m.id} seed={m.id} title={m.label} sub={`${unreadCount(m.id)} unread`} />
          ))}
        </AsideBox>
      }
    >
      {/* Desktop inbox switcher (mobile uses the module strip) */}
      <nav className="no-scrollbar mb-3 hidden gap-1.5 overflow-x-auto lg:flex" aria-label="Inboxes">
        {MODULES.map((m) => {
          const unread = unreadCount(m.id);
          return (
            <Link
              key={m.id}
              href={`/messages/${m.id}`}
              aria-current={m.id === module ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                m.id === module ? "border-foreground bg-foreground text-card" : "bg-card hover:bg-muted",
              )}
            >
              {m.label}
              {unread > 0 && (
                <span className="rounded-md bg-gold px-1 font-mono text-[9px] font-medium text-gold-foreground">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <h1 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
        Messages <KindTag>{mod.label}</KindTag>
      </h1>

      {threads.map((thread) => (
        <div key={thread.who} className="mb-2 flex items-center gap-3 rounded-lg border bg-card p-3">
          <span
            className={cn("size-9 shrink-0 rounded-full", (module === "groups" || module === "business") && "rounded-lg")}
            style={seedGradient(`${thread.who}av`)}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{thread.who}</div>
            <div className="truncate text-xs text-muted-foreground">{thread.preview}</div>
          </div>
          <span className="shrink-0 rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] text-accent">
            {thread.context}
          </span>
          {thread.unread && <span className="size-2 shrink-0 rounded-full bg-gold" />}
        </div>
      ))}
    </ModulePage>
  );
}
