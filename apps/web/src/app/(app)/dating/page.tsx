import type { JSX } from "react";
import type { Metadata } from "next";
import { Heart, X } from "lucide-react";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { DATING_PROFILES } from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";

export const metadata: Metadata = { title: "Dating" };

/**
 * Dating — distance-bound, ice-breakers from shared groups/events/trades.
 * Deliberately basic styling for now; ships last (BRIDGE-brief §10).
 */
export default function DatingPage(): JSX.Element {
  return (
    <ModulePage
      dark
      aside={
        <>
          <AsideBox title="Your dating profile">
            <AsideRow seed="visible" title="Visible to: Discover" sub="Hidden from contacts" />
            <AsideRow seed="interests" title="Interests from groups" sub="3 imported" />
          </AsideBox>
          <AsideBox title="Ice-breakers">
            <AsideRow seed="Swap meet" title="Swap meet · Trnava" sub="You both are going" />
          </AsideBox>
        </>
      }
    >
      <div className="mx-auto max-w-sm">
        <FilterBar module="dating" dark />
        <div className="flex flex-col gap-4">
          {DATING_PROFILES.map((profile) => {
            return (
              <article
                key={profile.id}
                className="relative flex min-h-96 flex-col justify-end overflow-hidden rounded-2xl p-4 text-white"
                style={seedGradient(`${profile.name} portrait`, true)}
              >
                <div className="font-display text-lg font-bold">
                  {profile.name}, {profile.age} <span className="text-sm font-normal opacity-80">· {profile.distance}</span>
                </div>
                <div className="text-sm opacity-90">{profile.interests}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs backdrop-blur">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-5">
                  <button
                    type="button"
                    aria-label="Pass"
                    className="flex size-11 items-center justify-center rounded-full bg-white text-foreground shadow-lg"
                  >
                    <X className="size-5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Like"
                    className="flex size-11 items-center justify-center rounded-full bg-accent text-white shadow-lg"
                  >
                    <Heart className="size-5" strokeWidth={2} />
                  </button>
                </div>
              </article>
            );
          })}
          <div className="rounded-lg border border-white/15 bg-white/5 p-3 text-white">
            <div className="text-sm font-semibold">Why this feels safe</div>
            <p className="mt-1 text-xs opacity-75">
              Profiles are the same verified Bridge accounts. Shared groups, events and marketplace history are the
              ice-breakers — no separate photos-only app.
            </p>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}
