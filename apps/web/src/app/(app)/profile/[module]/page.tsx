import type { JSX } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ModulePage } from "@/components/shell/module-page";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { CourseCard, JobCard, KindTag, ListingCard } from "@/components/module/cards";
import { PostCard } from "@/components/module/cards";
import { getModule, isModuleId, MODULES } from "@/modules/registry";
import type { ModuleId } from "@/modules/registry";
import {
  COURSES_CONTINUE,
  CURRENT_USER,
  GROUPS_YOURS,
  JOBS,
  LISTINGS,
  POSTS,
  PROFILE_LINKS,
} from "@/modules/mock-data";
import { seedGradient } from "@/lib/seed-gradient";

interface Props {
  params: Promise<{ module: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module } = await params;
  const mod = getModule(module);
  return { title: mod ? `Profile · ${mod.label}` : "Profile" };
}

/**
 * Profile is scoped by module (BRIDGE-brief §2): the same screen, a
 * different lens. Main-profile modules (Posts/Reels/Groups) show the shared
 * social identity; the others show that module's own profile with its
 * linked/separate state.
 */
export default async function ModuleProfilePage({ params }: Props): Promise<JSX.Element> {
  const { module } = await params;
  if (!isModuleId(module)) notFound();
  // Feed's profile lens IS the identity map.
  if (module === "feed") redirect("/profile");
  const mod = getModule(module);
  if (!mod) notFound();

  const linkState = PROFILE_LINKS[module];

  return (
    <ModulePage
      aside={
        <AsideBox title="Identity map">
          <AsideRow seed="main" title="Main profile" sub="Feed · Posts · Reels · Marketplace · Groups" />
          {MODULES.filter((m) => m.profile === "module").map((m) => {
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
      <h1 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
        Profile <KindTag>{mod.label}</KindTag>
      </h1>

      {/* Header card */}
      <div className="mb-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="size-11 rounded-full" style={seedGradient(CURRENT_USER.name)} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{module === "dating" ? "Jakub" : CURRENT_USER.name}</div>
            <div className="text-xs text-muted-foreground">{profileSub(module)}</div>
          </div>
          {mod.profile === "main" ? (
            <KindTag>main</KindTag>
          ) : linkState === "linked" ? (
            <KindTag>✓ linked</KindTag>
          ) : null}
        </div>
      </div>

      {/* Link card for module-profile modules */}
      {mod.profile === "module" &&
        (linkState === "none" || linkState === undefined ? (
          <div className="mb-3 rounded-lg border border-dashed bg-card p-3">
            <div className="text-sm font-semibold">No {mod.label} profile yet</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Create one when you need it. It starts unlinked; you can link it to your main profile later for trust.
            </p>
            <button type="button" className="mt-2 w-full rounded-full bg-foreground py-1.5 text-sm font-semibold text-card">
              Create {mod.label} profile
            </button>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">
                {linkState === "linked" ? "Linked to main profile" : "Not linked to main profile"}
              </div>
              <p className="text-xs text-muted-foreground">
                {linkState === "linked"
                  ? `Shows ✓ ${CURRENT_USER.name} · carries your main profile's history and trust`
                  : "Shown separately · people here cannot see your main profile identity"}
              </p>
            </div>
            <span
              className={`relative h-5 w-9 shrink-0 rounded-full ${linkState === "linked" ? "bg-accent" : "bg-border"}`}
              aria-label={linkState === "linked" ? "Linked" : "Not linked"}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-card transition-all ${linkState === "linked" ? "left-[18px]" : "left-0.5"}`}
              />
            </span>
          </div>
        ))}

      <ModuleLensBody module={module} />
    </ModulePage>
  );
}

function profileSub(module: ModuleId): string {
  switch (module) {
    case "market":
      return "Seller · 4.8★ · 31 sales · Detva";
    case "dating":
      return "Jakub, 32 · Detva · Visible in Discover";
    case "courses":
      return "Learner · 2 certificates";
    case "jobs":
      return "Open to part-time & gigs · CV updated May";
    case "business":
      return "No business page yet";
    default:
      return `${CURRENT_USER.handle} · Main profile · Posts · Reels · Marketplace · Groups`;
  }
}

function ModuleLensBody({ module }: { module: ModuleId }): JSX.Element | null {
  switch (module) {
    case "market":
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LISTINGS.slice(4, 6).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      );
    case "posts":
      return (
        <div className="rounded-lg border bg-card px-3">
          {POSTS.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={{ ...post, author: CURRENT_USER.name, handle: CURRENT_USER.handle }} />
          ))}
        </div>
      );
    case "reels":
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="block aspect-[9/14] rounded-lg" style={seedGradient(`jakub reel ${i}`)} />
          ))}
        </div>
      );
    case "groups":
      return (
        <>
          {GROUPS_YOURS.map((group) => (
            <div key={group.id} className="mb-2 flex items-center gap-3 rounded-lg border bg-card p-3">
              <span className="size-9 rounded-lg" style={seedGradient(group.name)} />
              <div className="min-w-0 flex-1 text-sm font-semibold">{group.name}</div>
            </div>
          ))}
        </>
      );
    case "courses":
      return (
        <>
          {COURSES_CONTINUE.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          <div className="rounded-lg border bg-card p-3">
            <div className="text-sm font-semibold">Certificates</div>
            <div className="text-xs text-muted-foreground">Photos that convert · Selling on Bridge</div>
          </div>
        </>
      );
    case "jobs":
      return (
        <>
          {JOBS.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={{ ...job, pay: "" }} />
          ))}
        </>
      );
    case "dating":
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="block aspect-[3/4] rounded-lg" style={seedGradient(`jakub photo ${i}`)} />
          ))}
        </div>
      );
    case "business":
      return (
        <div className="rounded-lg border bg-card p-3">
          <div className="text-sm font-semibold">What a business page gets</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Verification, jobs, courses, analytics. Linking it to your main profile shows the owner&apos;s ✓.
          </p>
        </div>
      );
    default:
      return null;
  }
}
