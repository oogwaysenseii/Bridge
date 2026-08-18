import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ModulePage } from "@/components/shell/module-page";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { KindTag, SectionHeading } from "@/components/module/cards";
import { MODULES } from "@/modules/registry";
import { CURRENT_USER, PROFILE_LINKS } from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";

export const metadata: Metadata = { title: "Profile" };

/**
 * The identity map: the main profile (shared by Feed, Posts, Reels,
 * Marketplace and Groups — one follow covers them all) plus each module
 * profile's status: linked / separate / not created. Business, Dating,
 * Courses and Jobs are activated and filled in separately when needed.
 */
export default function ProfilePage(): JSX.Element {
  const moduleProfiles = MODULES.filter((m) => m.profile === "module");

  return (
    <ModulePage
      aside={
        <AsideBox title="Identity map">
          <AsideRow seed="main" title="Main profile" sub="Feed · Posts · Reels · Marketplace · Groups" />
          {moduleProfiles.map((m) => {
            const state = PROFILE_LINKS[m.id] ?? "none";
            return (
              <AsideRow
                key={m.id}
                seed={m.id}
                title={m.label}
                sub={state === "none" ? "not created" : state === "linked" ? "linked ✓" : "separate"}
              />
            );
          })}
        </AsideBox>
      }
    >
      <div className="mb-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="size-12 rounded-full" style={seedGradient(CURRENT_USER.name)} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-base font-bold">{CURRENT_USER.name}</div>
            <div className="text-xs text-muted-foreground">
              {CURRENT_USER.handle} · Main profile · Posts · Reels · Marketplace · Groups
            </div>
          </div>
          <KindTag>main</KindTag>
        </div>
        <div className="mt-3 flex gap-6 text-sm">
          <span>
            <b className="font-display">{CURRENT_USER.followers}</b> followers
          </span>
          <span>
            <b className="font-display">{CURRENT_USER.following}</b> following
          </span>
          <span>
            <b className="font-display">{CURRENT_USER.groups}</b> groups
          </span>
        </div>
        <button type="button" className="mt-3 w-full rounded-full border py-1.5 text-sm font-medium hover:bg-muted">
          Edit main profile
        </button>
      </div>

      <SectionHeading>Module profiles</SectionHeading>
      {moduleProfiles.map((m) => {
        const state = PROFILE_LINKS[m.id] ?? "none";
        return (
          <Link
            key={m.id}
            href={`/profile/${m.id}`}
            className="mb-2 flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted"
          >
            <span className="size-9 rounded-lg" style={seedGradient(m.id)} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{m.label}</div>
              <div className="text-xs text-muted-foreground">
                {state === "none" ? "not created" : state === "linked" ? "created · linked to main ✓" : "created · separate"}
              </div>
            </div>
            <span className="rounded-full border px-3 py-1 text-xs font-medium">
              {state === "none" ? "Create" : "Open"}
            </span>
          </Link>
        );
      })}

      <div className="mt-3 rounded-lg border bg-card p-3">
        <div className="text-sm font-semibold">Why link?</div>
        <p className="mt-1 text-xs text-muted-foreground">
          A linked module profile carries your main identity&apos;s ✓ and history — students, employers and business
          partners trust it more. Unlinked profiles keep the module&apos;s integrity: what you learn, date or hire
          stays separate from what you post and sell.
        </p>
      </div>
    </ModulePage>
  );
}
