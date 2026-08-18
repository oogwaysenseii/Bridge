import type { JSX, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { BusinessCard, CourseCard, GroupCard, JobCard, ListingCard, PostCard } from "@/components/module/cards";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { getModule } from "@/modules/registry";
import type { ModuleId } from "@/modules/registry";
import {
  BUSINESSES,
  COURSES_CONTINUE,
  COURSES_POPULAR,
  GROUPS_NEAR,
  GROUPS_YOURS,
  JOBS,
  LISTINGS,
  POSTS,
  REELS,
} from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Feed" };

/**
 * Feed — the cross-module digest, restructured as a shop window: one
 * section per module with a few latest/discover items in that module's
 * native card style, then the next module. Deliberately capped ("see a few,
 * open the module for the rest") so Feed never replaces visiting modules.
 * Section headers carry each module's identity color.
 */
export default function FeedPage(): JSX.Element {
  return (
    <ModulePage
      aside={
        <>
          <AsideBox title="Since your last visit">
            <AsideRow seed="visit" title="Yesterday 21:40" sub="27 updates · 6 modules" />
          </AsideBox>
          <AsideBox title="Quiet modules">
            <AsideRow seed="dating" title="Dating" sub="nothing new" />
          </AsideBox>
          <AsideBox title="Feed rules">
            <p className="text-xs text-muted-foreground">
              A few cards per module, promoted marked, never the module&apos;s whole stream. Tune in Filters.
            </p>
          </AsideBox>
        </>
      }
    >
      <FilterBar module="feed" />

      <ModuleSection module="market" note="3 new near you">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LISTINGS.slice(0, 3).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </ModuleSection>

      <ModuleSection module="posts" note="from people you follow">
        <div className="rounded-lg border bg-card px-3">
          {POSTS.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </ModuleSection>

      <ModuleSection module="reels" note="new this week">
        <div className="grid grid-cols-3 gap-3">
          {REELS.slice(0, 3).map((reel) => (
            <Link
              key={reel.id}
              href="/reels"
              className="relative flex aspect-[9/16] flex-col justify-end overflow-hidden rounded-lg p-2.5 text-white"
              style={seedGradient(reel.caption, true)}
            >
              <span className="text-xs font-semibold leading-snug">{reel.author}</span>
              <span className="line-clamp-2 text-[11px] opacity-85">{reel.caption}</span>
            </Link>
          ))}
        </div>
      </ModuleSection>

      <ModuleSection module="groups" note="12 new posts in yours">
        {GROUPS_YOURS.slice(0, 1).map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
        {GROUPS_NEAR.slice(0, 1).map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </ModuleSection>

      <ModuleSection module="business" note="near you">
        {BUSINESSES.slice(0, 2).map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </ModuleSection>

      <ModuleSection module="courses" note="continue learning">
        <div className="sm:grid sm:grid-cols-2 sm:gap-2.5">
          {COURSES_CONTINUE.slice(0, 1).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          {COURSES_POPULAR.slice(0, 1).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </ModuleSection>

      <ModuleSection module="jobs" note="matching your profile">
        {JOBS.slice(0, 3).map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </ModuleSection>
    </ModulePage>
  );
}

/** Feed section frame: colored module header + a capped set of items + Open link. */
function ModuleSection({
  module,
  note,
  children,
}: {
  module: ModuleId;
  note?: string;
  children: ReactNode;
}): JSX.Element | null {
  const mod = getModule(module);
  if (!mod) return null;
  const Icon = mod.icon;

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center gap-2.5">
        <span className={cn("flex size-7 items-center justify-center rounded-lg", mod.color.soft)}>
          <Icon className={cn("size-4", mod.color.text)} strokeWidth={1.8} />
        </span>
        <h2 className={cn("font-display text-sm font-bold", mod.color.text)}>
          <Link href={mod.href}>{mod.label}</Link>
        </h2>
        {note && <span className="text-xs text-muted-foreground">· {note}</span>}
        <Link
          href={mod.href}
          className={cn("ml-auto flex items-center gap-1 text-xs font-semibold", mod.color.text)}
        >
          Open <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
      {children}
    </section>
  );
}
