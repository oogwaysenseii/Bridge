import type { LucideIcon } from "lucide-react";
import {
  Newspaper,
  MessageSquareText,
  Clapperboard,
  Store,
  Users,
  Building2,
  Heart,
  GraduationCap,
  BriefcaseBusiness,
} from "lucide-react";

/**
 * The module registry — the one place the shell learns what modules exist.
 *
 * Per BRIDGE-brief §2, the shell never changes; every module is just a page
 * + a Messages lens + a Profile lens + a search result group + a right-panel
 * context. Adding/hiding/reordering a module happens here and nowhere else.
 *
 * Naming note vs the plaza-layout mock: the mock used `home` for the digest
 * and `feed` for text posts. Here the ids are the plain names — `feed` is
 * the cross-module digest (first module, app opens here), `posts` is the
 * X/Threads-style text module.
 */
export type ModuleId =
  | "feed"
  | "posts"
  | "reels"
  | "market"
  | "groups"
  | "business"
  | "dating"
  | "courses"
  | "jobs";

/**
 * Per-module identity color for orientation — active nav states, feed
 * section headers, kind tags. Complete Tailwind class strings (Tailwind
 * can't build class names dynamically). Gold stays reserved for money.
 */
export interface ModuleColor {
  /** Text color, with a lighter dark-mode variant. */
  text: string;
  /** Soft tinted background for active/selected states (incl. hover). */
  soft: string;
  /** Border in the module color (strip underline, accents). */
  border: string;
}

export interface ModuleDef {
  id: ModuleId;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Reels & Dating render on a dark surface. */
  dark?: boolean;
  /**
   * Which identity serves this module: the shared main profile (Feed, Posts,
   * Reels, Marketplace, Groups — one follow covers them all) or a separate
   * module profile (Business, Dating, Courses, Jobs) that the user activates
   * and fills in when needed and can optionally link to the main profile to
   * inherit its ✓ and history for trust.
   */
  profile: "main" | "module";
  color: ModuleColor;
}

export const MODULES: ModuleDef[] = [
  {
    id: "feed",
    label: "Feed",
    href: "/feed",
    icon: Newspaper,
    profile: "main",
    // Feed keeps the brand verdigris.
    color: { text: "text-accent", soft: "bg-accent-soft hover:bg-accent-soft", border: "border-accent" },
  },
  {
    id: "posts",
    label: "Posts",
    href: "/posts",
    icon: MessageSquareText,
    profile: "main",
    color: { text: "text-sky-700 dark:text-sky-400", soft: "bg-sky-600/10 hover:bg-sky-600/15", border: "border-sky-600" },
  },
  {
    id: "reels",
    label: "Reels",
    href: "/reels",
    icon: Clapperboard,
    dark: true,
    profile: "main",
    color: { text: "text-violet-700 dark:text-violet-400", soft: "bg-violet-600/10 hover:bg-violet-600/15", border: "border-violet-600" },
  },
  {
    id: "market",
    label: "Marketplace",
    href: "/market",
    icon: Store,
    profile: "main",
    color: { text: "text-orange-700 dark:text-orange-400", soft: "bg-orange-600/10 hover:bg-orange-600/15", border: "border-orange-600" },
  },
  {
    id: "groups",
    label: "Groups",
    href: "/groups",
    icon: Users,
    profile: "main",
    color: { text: "text-blue-700 dark:text-blue-400", soft: "bg-blue-600/10 hover:bg-blue-600/15", border: "border-blue-600" },
  },
  {
    id: "business",
    label: "Business",
    href: "/business",
    icon: Building2,
    profile: "module",
    color: { text: "text-zinc-700 dark:text-zinc-300", soft: "bg-zinc-600/10 hover:bg-zinc-600/15", border: "border-zinc-700" },
  },
  {
    id: "dating",
    label: "Dating",
    href: "/dating",
    icon: Heart,
    dark: true,
    profile: "module",
    color: { text: "text-rose-700 dark:text-rose-400", soft: "bg-rose-600/10 hover:bg-rose-600/15", border: "border-rose-600" },
  },
  {
    id: "courses",
    label: "Courses",
    href: "/courses",
    icon: GraduationCap,
    profile: "module",
    color: { text: "text-teal-700 dark:text-teal-400", soft: "bg-teal-600/10 hover:bg-teal-600/15", border: "border-teal-600" },
  },
  {
    id: "jobs",
    label: "Jobs",
    href: "/jobs",
    icon: BriefcaseBusiness,
    profile: "module",
    color: { text: "text-indigo-700 dark:text-indigo-400", soft: "bg-indigo-600/10 hover:bg-indigo-600/15", border: "border-indigo-600" },
  },
];

export const MODULE_IDS: ModuleId[] = MODULES.map((m) => m.id);

export function getModule(id: string): ModuleDef | undefined {
  return MODULES.find((m) => m.id === id);
}

export function isModuleId(id: string): id is ModuleId {
  return MODULES.some((m) => m.id === id);
}

/**
 * Derive the active module from a pathname, e.g. /market/oak-side-table →
 * market, /messages/jobs → jobs, /profile/dating → dating. Returns undefined
 * for universal screens (/notifications, /search) and non-module routes.
 */
export function moduleFromPathname(pathname: string): ModuleDef | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (!first) return undefined;
  if (isModuleId(first)) return getModule(first);
  if ((first === "messages" || first === "profile") && segments[1] && isModuleId(segments[1])) {
    return getModule(segments[1]);
  }
  return undefined;
}
