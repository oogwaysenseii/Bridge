import type { JSX } from "react";
import Link from "next/link";
import { BadgeCheck, Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { seedGradient } from "@/lib/seed-gradient";
import type { Business, Course, DigestItem, Group, Job, Listing, Post } from "@/modules/mock-data";
import { getListing } from "@/modules/mock-data";

/*
 * Typed cards (BRIDGE-brief §8): every feed item shares one card anatomy —
 * header (avatar · name · sub · kind tag top-right), body, action row.
 * The kind tag is what makes a listing look native inside a social feed.
 */

export function KindTag({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <span
      className={cn(
        "rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Gold tag — reserved for money signals (price badges, deal labels). */
export function GoldTag({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <span className="rounded-md bg-gold px-1.5 py-0.5 font-mono text-[9px] font-medium text-gold-foreground">
      {children}
    </span>
  );
}

/* --------------------------------- listing --------------------------------- */

const FRESHNESS_COLOR = {
  ok: "bg-accent",
  stale: "bg-gold",
  old: "bg-muted-foreground/60",
} as const;

const FRESHNESS_TITLE = {
  ok: "Confirmed available recently",
  stale: "Not confirmed recently",
  old: "Old listing",
} as const;

/**
 * Listing card: photo, price (mono), title, distance/location, optional tag
 * and the freshness dot (green = confirmed available, amber = not confirmed
 * recently, grey = old) — BRIDGE-brief §5.
 */
export function ListingCard({ listing }: { listing: Listing }): JSX.Element {
  return (
    <Link
      href={`/market/${listing.id}`}
      className="block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square" style={seedGradient(listing.name)}>
        <span
          className={cn(
            "absolute left-2 top-2 size-2.5 rounded-full border-2 border-card shadow",
            FRESHNESS_COLOR[listing.freshness],
          )}
          title={FRESHNESS_TITLE[listing.freshness]}
        />
      </div>
      <div className="p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-medium">{listing.price}</span>
          {listing.tag && <GoldTag>{listing.tag}</GoldTag>}
        </div>
        <div className="truncate text-sm">{listing.name}</div>
        <div className="truncate text-xs text-muted-foreground">{listing.location}</div>
      </div>
    </Link>
  );
}

/* ---------------------------------- digest --------------------------------- */

/** Feed digest card: one card per event, every card opens its module. */
export function DigestCard({ item }: { item: DigestItem }): JSX.Element {
  const listing = item.listing ? getListing(item.listing) : undefined;
  return (
    <article className={cn("mb-3 rounded-lg border bg-card p-3", item.promo && "border-dashed")}>
      <div className="flex items-center gap-2.5">
        <span className="size-8 shrink-0 rounded-full" style={seedGradient(`${item.who}av`)} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{item.who}</div>
          <div className="truncate text-xs text-muted-foreground">{item.what}</div>
        </div>
        <KindTag>{item.module}</KindTag>
      </div>
      {listing && (
        <Link href={`/market/${listing.id}`} className="mt-2.5 flex items-center gap-3 rounded-lg border p-2 hover:bg-muted">
          <span className="size-14 shrink-0 rounded-md" style={seedGradient(listing.name)} />
          <div className="min-w-0">
            <div className="font-mono text-sm font-medium">{listing.price}</div>
            <div className="truncate text-sm">{listing.name}</div>
            <div className="truncate text-xs text-muted-foreground">{listing.location}</div>
          </div>
        </Link>
      )}
      {item.media && <div className="mt-2.5 aspect-video rounded-lg" style={seedGradient(item.media)} />}
      <div className="mt-2 text-sm font-semibold text-accent">{item.cta} →</div>
    </article>
  );
}

/* ---------------------------------- x-post --------------------------------- */

/** Posts module: X/Threads-style text post, optionally quoting a listing. */
export function PostCard({ post }: { post: Post }): JSX.Element {
  const quoted = post.quoteListing ? getListing(post.quoteListing) : undefined;
  return (
    <article className="flex gap-3 border-b px-1 py-3.5">
      <span className="size-9 shrink-0 rounded-full" style={seedGradient(`${post.author}av`)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 text-sm">
          <span className="font-semibold">{post.author}</span>
          {post.verified && <BadgeCheck className="size-3.5 self-center text-accent" strokeWidth={2} />}
          <span className="truncate text-xs text-muted-foreground">
            {post.handle} · {post.time}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed">{post.text}</p>
        {post.image && <div className="mt-2 aspect-video rounded-lg" style={seedGradient(post.text)} />}
        {quoted && (
          <Link href={`/market/${quoted.id}`} className="mt-2 flex items-center gap-3 overflow-hidden rounded-lg border hover:bg-muted">
            <span className="size-16 shrink-0" style={seedGradient(quoted.name)} />
            <div className="min-w-0 py-1.5 pr-2">
              <div className="font-mono text-sm font-medium">{quoted.price}</div>
              <div className="truncate text-sm">{quoted.name}</div>
              <div className="truncate text-xs text-muted-foreground">{quoted.location}</div>
            </div>
          </Link>
        )}
        <div className="mt-2 flex gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="size-3.5" strokeWidth={1.8} /> {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5" strokeWidth={1.8} /> {post.replies}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="size-3.5" strokeWidth={1.8} /> {post.reposts}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="size-3.5" strokeWidth={1.8} />
          </span>
        </div>
      </div>
    </article>
  );
}

/* --------------------------------- group row -------------------------------- */

export function GroupCard({ group }: { group: Group }): JSX.Element {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-lg border bg-card p-3">
      <span className="size-9 shrink-0 rounded-lg" style={seedGradient(group.name)} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{group.name}</div>
        <div className="truncate text-xs text-muted-foreground">{group.detail}</div>
      </div>
      <button
        type="button"
        className={cn(
          "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
          group.joined ? "hover:bg-muted" : "border-accent text-accent hover:bg-accent-soft",
        )}
      >
        {group.joined ? "Open" : "Join"}
      </button>
    </div>
  );
}

/* ------------------------------- business row ------------------------------- */

export function BusinessCard({ business }: { business: Business }): JSX.Element {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-lg border bg-card p-3">
      <span className="size-9 shrink-0 rounded-lg" style={seedGradient(business.name)} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{business.name}</div>
        <div className="truncate text-xs text-muted-foreground">{business.detail}</div>
      </div>
      {business.tag && <GoldTag>{business.tag}</GoldTag>}
    </div>
  );
}

/* --------------------------------- course ---------------------------------- */

export function CourseCard({ course }: { course: Course }): JSX.Element {
  return (
    <div className="mb-2.5 flex overflow-hidden rounded-lg border bg-card">
      <div className="w-20 shrink-0" style={seedGradient(course.title)} />
      <div className="min-w-0 flex-1 p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold leading-snug">{course.title}</div>
          <span className="shrink-0 font-mono text-xs font-medium">{course.price}</span>
        </div>
        <div className="truncate text-xs text-muted-foreground">{course.by}</div>
        {course.progress ? (
          <>
            <div className="mt-1.5 h-1 rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent" style={{ width: course.progress }} />
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{course.progress} done</div>
          </>
        ) : (
          <div className="mt-1 text-xs font-medium text-accent">Start course →</div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------- job ----------------------------------- */

export function JobCard({ job }: { job: Job }): JSX.Element {
  return (
    <div className="mb-2 flex items-start gap-3 rounded-lg border bg-card p-3">
      <span className="size-9 shrink-0 rounded-lg" style={seedGradient(job.detail)} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{job.title}</div>
        <div className="truncate text-xs text-muted-foreground">{job.detail}</div>
      </div>
      <span className="shrink-0 whitespace-nowrap font-mono text-xs">{job.pay}</span>
    </div>
  );
}

/* ------------------------------ section heading ----------------------------- */

export function SectionHeading({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <h2 className="mb-2 mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground first:mt-0">
      {children}
    </h2>
  );
}
