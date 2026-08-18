"use client";

import * as React from "react";
import { Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Freshness, ListingDetail } from "@/modules/mock-data";
import { offerPrice } from "@/modules/mock-data";

/*
 * Interactive parts of the product page (BRIDGE-brief §5):
 *
 * - Quick questions: one tap sends a normal Marketplace message; an
 *   availability answer refreshes the stamp for everyone.
 *
 * Classifieds mode: money never moves through Bridge for now (Bazoš-style —
 * reserve on Bridge, pay the seller directly), and delivery is arranged in
 * chat, so no delivery UI either. The `delivery`/`ship` data model stays for
 * the later in-app checkout (shops/businesses selling through Bridge).
 *
 * All simulated against mock data.
 */

interface AvailabilityView {
  state: Freshness;
  title: string;
  detail: string;
  refreshed: string;
}

const AVAILABILITY_STYLE: Record<Freshness, string> = {
  ok: "bg-accent-soft text-accent",
  stale: "bg-gold/20 text-yellow-800 dark:text-gold",
  old: "bg-muted text-muted-foreground",
};

export function AvailabilityStamp({ availability }: { availability: AvailabilityView }): React.JSX.Element {
  return (
    <div className={cn("my-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs", AVAILABILITY_STYLE[availability.state])}>
      <span className="size-2 shrink-0 rounded-full bg-current" />
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{availability.title}</div>
        <div className="truncate opacity-85">{availability.detail}</div>
      </div>
      <span className="shrink-0 font-mono text-[10px]">{availability.refreshed}</span>
    </div>
  );
}

export function ListingInteractive({ detail, price }: { detail: ListingDetail; price: string }): React.JSX.Element {
  const [availability, setAvailability] = React.useState<AvailabilityView>(detail.availability);
  const [sent, setSent] = React.useState<Record<string, boolean>>({});
  const [toast, setToast] = React.useState<string | null>(null);

  function ask(key: string, isAvailability: boolean): void {
    setSent((s) => ({ ...s, [key]: true }));
    setToast("Sent to the seller as a Marketplace message. You'll get a push when they answer.");
    if (isAvailability) {
      // Simulated seller confirmation — updates the stamp for everyone.
      setTimeout(() => {
        setAvailability({
          state: "ok",
          title: "Confirmed available",
          detail: "Seller confirmed just now · to your quick question",
          refreshed: "Refreshed just now",
        });
        setToast(`${detail.seller} replied: "Yes, still available." · Listing refreshed for everyone.`);
      }, 2000);
    }
    setTimeout(() => { setToast(null); }, 4500);
  }

  function sendOffer(amount: string): void {
    setSent((s) => ({ ...s, offer: true }));
    setToast(`Offer of €${amount} sent to the seller as a Marketplace message. You'll get a push when they answer.`);
    setTimeout(() => { setToast(null); }, 4500);
  }

  const questions = [
    { key: "avail", label: "Is it still available?", availability: true },
    { key: "ship", label: "Can you ship it?", availability: false },
    { key: "today", label: "Can I pick it up today?", availability: false },
  ];

  return (
    <>
      <AvailabilityStamp availability={availability} />

      {/* Quick questions — its own card so it reads as one distinct block. */}
      <section className="mb-4 rounded-xl border bg-muted/50 p-3">
        <h3 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Quick questions
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q) => (
            <button
              key={q.key}
              type="button"
              disabled={sent[q.key]}
              onClick={() => { ask(q.key, q.availability); }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                sent[q.key] ? "border-foreground bg-foreground text-card" : "bg-card hover:bg-background",
              )}
            >
              {sent[q.key] ? "Sent ✓" : q.label}
            </button>
          ))}
          <OfferChip suggested={offerPrice(price)} onSend={sendOffer} sent={sent["offer"] ?? false} />
        </div>
      </section>

      {/* Actions — fixed above the tab bar on mobile; on desktop a distinct
          elevated card with clear space around it. */}
      <div className="fixed inset-x-0 bottom-16 z-30 flex gap-2 border-t bg-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:static lg:z-auto lg:mb-5 lg:rounded-xl lg:border lg:p-3 lg:shadow-md">
        <button type="button" aria-label="Save" className="flex w-12 items-center justify-center rounded-full border hover:bg-muted">
          <Heart className="size-4" strokeWidth={1.8} />
        </button>
        <button type="button" aria-label="Share" className="flex w-12 items-center justify-center rounded-full border hover:bg-muted">
          <Share2 className="size-4" strokeWidth={1.8} />
        </button>
        <button type="button" className="flex-1 rounded-full border border-foreground py-2.5 text-sm font-semibold hover:bg-muted">
          Message
        </button>
        <button type="button" className="flex-1 rounded-full bg-foreground py-2.5 text-sm font-semibold text-card hover:opacity-90">
          Reserve · {price}
        </button>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-xl bg-foreground px-4 py-3 text-xs text-card shadow-xl lg:bottom-6"
        >
          {toast}
        </div>
      )}
    </>
  );
}

/** "Make an offer: € [amount] Send" — fixed label, user types the number. */
function OfferChip({
  suggested,
  sent,
  onSend,
}: {
  suggested: string;
  sent: boolean;
  onSend: (amount: string) => void;
}): React.JSX.Element {
  const [value, setValue] = React.useState("");
  const amount = value.trim();

  if (sent) {
    return (
      <span className="rounded-full border border-foreground bg-foreground px-3 py-1.5 text-xs text-card">
        Offer sent ✓
      </span>
    );
  }

  return (
    <form
      className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        if (amount) onSend(amount);
      }}
    >
      <label htmlFor="offer-amount" className="whitespace-nowrap">
        Make an offer:
      </label>
      <span className="font-mono text-muted-foreground">€</span>
      <input
        id="offer-amount"
        type="number"
        min={1}
        inputMode="numeric"
        placeholder={suggested.replace("€", "")}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        className="w-12 bg-transparent font-mono outline-none [appearance:textfield] placeholder:text-muted-foreground [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="submit" disabled={!amount} className="font-semibold text-accent disabled:opacity-40">
        Send
      </button>
    </form>
  );
}
