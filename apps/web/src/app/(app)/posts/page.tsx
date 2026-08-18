import type { JSX } from "react";
import type { Metadata } from "next";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { PostCard } from "@/components/module/cards";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { POSTS, CURRENT_USER } from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";

export const metadata: Metadata = { title: "Posts" };

/** Posts — X/Threads-style short text, replies, reposts, quote-posts of listings. */
export default function PostsPage(): JSX.Element {
  return (
    <ModulePage
      aside={
        <>
          <AsideBox title="People & shops to follow">
            <AsideRow seed="Roman's Records" title="Roman's Records" sub="Vinyl · Košice" />
            <AsideRow seed="Studio Lipa" title="Studio Lipa" sub="Interior design" />
          </AsideBox>
          <AsideBox title="Where this feed comes from">
            <AsideRow seed="following" title="Following · Posts" sub="34 profiles you follow here" />
            <AsideRow seed="groups" title="Groups you joined" sub="3 · shown as group cards" />
            <AsideRow seed="discovery" title="Discovery" sub="For you / Near me via filters" />
          </AsideBox>
          <AsideBox title="Trending near you">
            <AsideRow seed="#garagesale" title="#garagesale" sub="128 posts" />
            <AsideRow seed="#bratislavabikes" title="#bratislavabikes" sub="64 posts" />
          </AsideBox>
        </>
      }
    >
      <FilterBar module="posts" />
      <div className="mb-3 flex items-center gap-2.5 rounded-lg border bg-card p-3">
        <span className="size-8 shrink-0 rounded-full" style={seedGradient(CURRENT_USER.name)} />
        <div className="flex-1 rounded-full bg-background px-4 py-2 text-sm text-muted-foreground">
          What&apos;s happening?
        </div>
        <button type="button" className="rounded-full border px-3 py-1.5 text-xs">
          Image
        </button>
        <button type="button" className="hidden rounded-full border px-3 py-1.5 text-xs sm:block">
          Quote listing
        </button>
      </div>
      <div className="rounded-lg border bg-card px-3">
        {POSTS.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </ModulePage>
  );
}
