import type { JSX } from "react";
import type { Metadata } from "next";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { BusinessCard } from "@/components/module/cards";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { BUSINESSES } from "@/modules/mock-data";

export const metadata: Metadata = { title: "Business" };

/** Business — LinkedIn-style verified company pages, hiring and B2B posts. */
export default function BusinessPage(): JSX.Element {
  return (
    <ModulePage
      aside={
        <>
          <AsideBox title="Contact">
            <AsideRow seed="message" title="Message shop" sub="Replies in ~1h" />
            <AsideRow seed="book" title="Book a service" sub="Next slot Thu" />
          </AsideBox>
          <AsideBox title="Similar businesses">
            <AsideRow seed="Cyklo Bazár BA" title="Cyklo Bazár BA" sub="Retail" />
            <AsideRow seed="Wheelworks" title="Wheelworks" sub="Repairs" />
          </AsideBox>
        </>
      }
    >
      <FilterBar module="business" />
      {BUSINESSES.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
      <div className="mt-3 rounded-lg border bg-card p-3">
        <div className="text-sm font-semibold">Have a business?</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Turn your seller profile into a verified page: post jobs, publish courses, see analytics.
        </p>
      </div>
    </ModulePage>
  );
}
