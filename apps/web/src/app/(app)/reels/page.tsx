import type { JSX } from "react";
import type { Metadata } from "next";
import { Bookmark, Heart, MessageCircle, Share2, ShoppingBag } from "lucide-react";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { REELS } from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";

export const metadata: Metadata = { title: "Reels" };

/**
 * Reels — vertical video with shoppable tags. Basic layout for now: a
 * column of 9:16 cards on a dark surface (the full-screen snap feed comes
 * with the module build-out).
 */
export default function ReelsPage(): JSX.Element {
  return (
    <ModulePage
      dark
      aside={
        <>
          <AsideBox title="In this reel">
            <AsideRow seed="Stoneware mug set" title="Stoneware mug set" sub="€28 · ships free" />
            <AsideRow seed="Bat trimming tool" title="Bat trimming tool" sub="€14" />
          </AsideBox>
          <AsideBox title="Up next">
            <AsideRow seed="Bike fit" title="Bike fit in 60 seconds" sub="BikeShop Petržalka" />
            <AsideRow seed="Teak chair" title="Restoring a teak chair" sub="Vintage furniture SK" />
          </AsideBox>
        </>
      }
    >
      <div className="mx-auto max-w-sm">
        <FilterBar module="reels" dark />
        <div className="flex flex-col gap-4">
          {REELS.map((reel) => {
            return (
              <article
                key={reel.id}
                className="relative flex aspect-[9/16] flex-col justify-end overflow-hidden rounded-2xl p-4 text-white"
                style={seedGradient(reel.caption, true)}
              >
                {/* Right action rail */}
                <div className="absolute bottom-24 right-3 flex flex-col items-center gap-4 text-[10px]">
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
                      <Heart className="size-4" strokeWidth={1.8} />
                    </span>
                    {reel.likes}
                  </span>
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
                      <MessageCircle className="size-4" strokeWidth={1.8} />
                    </span>
                    {reel.comments}
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
                    <Share2 className="size-4" strokeWidth={1.8} />
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
                    <Bookmark className="size-4" strokeWidth={1.8} />
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-full border border-white/40" style={seedGradient(`${reel.author}av`)} />
                  <div className="text-sm font-semibold">{reel.author}</div>
                  <button type="button" className="rounded-full border border-white/40 px-2.5 py-0.5 text-xs">
                    Follow
                  </button>
                </div>
                <p className="mt-2 pr-12 text-sm">{reel.caption}</p>

                {/* Shoppable tag */}
                <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-white/15 p-2.5 backdrop-blur">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white/20">
                    <ShoppingBag className="size-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs">{reel.productName}</div>
                    <div className="font-mono text-xs font-medium text-gold">{reel.productCta}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ModulePage>
  );
}
