import type { JSX } from "react";
import type { Metadata } from "next";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { ListingCard } from "@/components/module/cards";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { LISTINGS } from "@/modules/mock-data";
import { FILTERS } from "@/modules/filters";

export const metadata: Metadata = { title: "Marketplace" };

/** Marketplace — the day-one module: listing grid with freshness dots. */
export default function MarketPage(): JSX.Element {
  const marketFilters = FILTERS.market;
  return (
    <ModulePage
      aside={
        <>
          {/* On desktop the Filters box is always present as the first box (brief §3). */}
          <AsideBox title="Filters">
            <p className="mb-2 text-[11px] text-muted-foreground">{marketFilters.scopeNote}</p>
            {marketFilters.groups.map((group) => (
              <div key={group.label} className="mb-2.5">
                <div className="mb-1 text-xs font-semibold">{group.label}</div>
                {group.options === "range" ? (
                  <div className="text-[11px] text-muted-foreground">{group.rangeHint}</div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {group.options.map((option) => (
                      <span key={option} className="rounded-full border px-2 py-0.5 text-[11px]">
                        {option}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button type="button" className="w-full rounded-full bg-foreground py-1.5 text-xs font-semibold text-card">
              Show results
            </button>
          </AsideBox>
          <AsideBox title="Sellers you follow">
            <AsideRow seed="Ceramics by Zuza" title="Ceramics by Zuza" sub="3 new listings" />
            <AsideRow seed="BikeShop Petržalka" title="BikeShop Petržalka" sub="weekend deal" />
          </AsideBox>
        </>
      }
    >
      <FilterBar module="market" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {LISTINGS.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </ModulePage>
  );
}
