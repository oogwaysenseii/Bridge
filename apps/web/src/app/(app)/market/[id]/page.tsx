import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronLeft, Heart, Share2 } from "lucide-react";
import { ModulePage } from "@/components/shell/module-page";
import { AsideBox } from "@/components/shell/aside-box";
import { GoldTag, ListingCard } from "@/components/module/cards";
import { ListingInteractive } from "@/components/module/listing-detail-client";
import { ListingGallery } from "@/components/module/listing-gallery";
import { LISTINGS, getListing, getListingDetail } from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: getListing(id)?.name ?? "Listing" };
}

/** Product detail page — BRIDGE-brief §5, the most detailed screen in the app. */
export default async function ListingPage({ params }: Props): Promise<JSX.Element> {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();
  const detail = getListingDetail(id);
  const moreFromSeller = LISTINGS.filter((l) => l.id !== id && getListingDetail(l.id).seller === detail.seller).slice(0, 5);
  const similar = LISTINGS.filter((l) => l.id !== id && !moreFromSeller.some((s) => s.id === l.id)).slice(0, 5);

  return (
    <ModulePage
      aside={
        <>
          <AsideBox title="Seller">
            <div className="flex items-center gap-2.5">
              <span className="size-9 rounded-full" style={seedGradient(`${detail.seller}av`)} />
              <div className="min-w-0 text-xs">
                <div className="flex items-center gap-1 font-semibold">
                  {detail.seller}
                  {detail.verified && <BadgeCheck className="size-3.5 text-accent" strokeWidth={2} />}
                </div>
                <div className="text-muted-foreground">{detail.sellerRating}</div>
              </div>
            </div>
          </AsideBox>

          {/* Price + actions — sticky with the panel, so the CTA never
              scrolls away on desktop. Layout only for now. */}
          <div className="mb-3 rounded-lg border bg-card p-3 shadow-sm">
            <div className="font-mono text-2xl font-medium">{detail.price}</div>
            <button
              type="button"
              className="mt-2.5 w-full rounded-full bg-foreground py-2 text-sm font-semibold text-card hover:opacity-90"
            >
              Reserve
            </button>
            <button
              type="button"
              className="mt-1.5 w-full rounded-full border border-foreground py-2 text-sm font-semibold hover:bg-muted"
            >
              Message seller
            </button>
            <div className="mt-2.5 flex justify-around text-xs text-muted-foreground">
              <button type="button" className="flex items-center gap-1 hover:text-foreground">
                <Heart className="size-3.5" strokeWidth={1.8} /> Save
              </button>
              <button type="button" className="flex items-center gap-1 hover:text-foreground">
                <Share2 className="size-3.5" strokeWidth={1.8} /> Share
              </button>
            </div>
          </div>

          <AsideBox title="How buying works">
            <p className="text-xs text-muted-foreground">
              Bridge is free classifieds: reserve the item on Bridge, then meet or arrange delivery and pay the
              seller directly. Bridge never touches the money and charges no fee. In-app checkout for shops and
              businesses selling through Bridge comes later.
            </p>
          </AsideBox>
        </>
      }
      below={
        <>
          {moreFromSeller.length > 0 && (
            <>
              <h2 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                More from {detail.seller}
              </h2>
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {moreFromSeller.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </>
          )}
          <h2 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Similar nearby
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          {/* Clearance for the fixed mobile action bar. */}
          <div className="h-16 lg:hidden" />
        </>
      }
    >
      <nav className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/market" className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted">
          <ChevronLeft className="size-4" strokeWidth={1.8} />
          Marketplace
        </Link>
        <span>›</span>
        <span>{detail.category}</span>
      </nav>

      {/* Full-width content, same padding as every module page. Two columns
          when there is room next to the right panel; stacked below that. */}
      <div className="gap-6 xl:grid xl:grid-cols-2">
        {/* Gallery */}
        <ListingGallery name={listing.name} />

        {/* Info */}
        <div className="mt-4 xl:mt-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-medium">{detail.price}</span>
            <span className="flex gap-1.5">
              {detail.tags.map((tag) => (
                <GoldTag key={tag}>{tag}</GoldTag>
              ))}
            </span>
          </div>
          <h1 className="mt-1 font-display text-xl font-bold">{listing.name}</h1>
          <div className="mt-1 flex flex-wrap gap-x-2 text-sm text-muted-foreground">
            <span>{detail.category}</span>
            <span>·</span>
            <span>{detail.condition}</span>
            <span>·</span>
            <span>
              <b className="text-foreground">{detail.distance}</b> · {detail.location}
            </span>
          </div>

          <ListingInteractive detail={detail} price={detail.price} />

          {/* Seller card — mobile/tablet only; on desktop the Seller box in
              the right panel covers it (no doubling). */}
          <div className="my-3 flex items-center gap-3 rounded-lg border bg-card p-3 lg:hidden">
            <span className="size-10 shrink-0 rounded-full" style={seedGradient(`${detail.seller}av`)} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-sm font-semibold">
                {detail.seller}
                {detail.verified && <BadgeCheck className="size-4 text-accent" strokeWidth={2} />}
              </div>
              <div className="text-xs text-muted-foreground">{detail.sellerRating} · replies in ~1 h</div>
              <span className="mt-1 inline-block rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
                {detail.verified ? "Verified account" : "Not verified yet"}
              </span>
            </div>
            <button type="button" className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium hover:bg-muted">
              Follow
            </button>
          </div>

          <p className="text-sm leading-relaxed">{detail.description}</p>

          {/* Key facts */}
          <dl className="my-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Posted</dt>
            <dd>{detail.posted}</dd>
            <dt className="text-muted-foreground">Views</dt>
            <dd>
              {detail.views} · {detail.saves} saved
            </dd>
            <dt className="text-muted-foreground">Condition</dt>
            <dd>{detail.condition}</dd>
            <dt className="text-muted-foreground">Location</dt>
            <dd>
              {detail.location} · {detail.distance} from you
            </dd>
          </dl>

          {/* Approximate-area map placeholder */}
          <div className="relative mb-3 h-28 overflow-hidden rounded-lg bg-accent-soft">
            <span className="absolute left-[42%] top-[30%] size-16 rounded-full border-2 border-accent bg-accent/20" />
            <span className="absolute bottom-2 left-2 rounded-md bg-card/90 px-2 py-0.5 text-[10px]">
              Approx. area · exact address after purchase
            </span>
          </div>
        </div>
      </div>

    </ModulePage>
  );
}
