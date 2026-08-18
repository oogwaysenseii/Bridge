import type { ModuleId } from "./registry";

/**
 * Declarative per-module filter config, ported from the mock's `FILTERS`.
 * Drives the filter bar (quick chips) and the filter sheet/panel (groups).
 * When modules get real APIs, the same registry should drive query-param
 * schemas so the UI and API can't drift.
 *
 * Per BRIDGE-brief §3: filters live inside the module page, not the chrome.
 * Posts and Reels have only a segmented Following/For-you toggle. Dating
 * never offers Global.
 */
export interface FilterGroup {
  label: string;
  /** "range" renders a range control; otherwise a chip list. */
  options: string[] | "range";
  rangeHint?: string;
}

export interface ModuleFilters {
  quick: string[];
  /** Index of the default-active quick chip. */
  defaultQuick: number;
  /** Posts/Reels: segmented toggle instead of Filters button + chips. */
  segmented?: boolean;
  scopeNote: string;
  groups: FilterGroup[];
}

export const FILTERS: Record<ModuleId, ModuleFilters> = {
  feed: {
    quick: ["Since last visit", "Following", "Near me", "Promoted"],
    defaultQuick: 0,
    scopeNote:
      "Feed is a digest across all modules: what changed for the profiles, groups, courses and jobs you chose, plus one or two discovery cards per module. Every card opens its module.",
    groups: [
      { label: "Include modules", options: ["Posts", "Reels", "Marketplace", "Groups", "Business", "Courses", "Jobs"] },
      { label: "Show", options: ["Only what I follow", "Also discovery", "Also promoted"] },
      { label: "Radius (when Near me)", options: "range", rangeHint: "5 km – 50 km" },
      { label: "Density", options: ["Compact", "Comfortable"] },
    ],
  },
  posts: {
    quick: ["Following", "For you"],
    defaultQuick: 0,
    segmented: true,
    scopeNote:
      "Posts is text-first, like X or Threads. Two feeds only: your follows, or the algorithm. Location and language are settings, not filters.",
    groups: [
      { label: "Show", options: ["Posts", "Replies", "Reposts", "Quotes of listings"] },
      { label: "Media", options: ["Any", "Text only", "With image", "With link"] },
      { label: "Language", options: ["Slovak", "English", "All"] },
      { label: "Sort", options: ["Newest", "Top today"] },
    ],
  },
  reels: {
    quick: ["For you", "Following"],
    defaultQuick: 0,
    segmented: true,
    scopeNote:
      "Reels default to For you; Following shows only creators you follow here. Shoppable-only and local are inside Filters, not quick chips.",
    groups: [
      { label: "Type", options: ["All", "Shoppable", "Tutorials", "Live"] },
      { label: "Category", options: ["Crafts", "Bikes", "Home", "Food", "Fashion"] },
      { label: "Local creators only", options: ["Off", "On"] },
      { label: "Sound", options: ["Any", "Original", "Muted"] },
    ],
  },
  market: {
    quick: ["Near me", "Ships to me", "Slovakia", "Global"],
    defaultQuick: 0,
    scopeNote: "Scope is the primary axis. Near me radius is remembered per module.",
    groups: [
      { label: "Radius", options: "range", rangeHint: "5 km – 50 km" },
      { label: "Category", options: ["Furniture", "Bikes", "Electronics", "Handmade", "Kids", "Cars"] },
      { label: "Price", options: "range", rangeHint: "€10 – €300" },
      { label: "Condition", options: ["New", "Like new", "Used", "For parts"] },
      { label: "Delivery", options: ["Pickup", "Courier", "Free shipping"] },
      { label: "Seller", options: ["4.5★+", "Verified", "Business"] },
    ],
  },
  groups: {
    quick: ["Yours", "Near me", "Discover", "Active now"],
    defaultQuick: 0,
    scopeNote: "Groups can be local (a town) or topical (nation-wide). Near me shows town-based groups first.",
    groups: [
      { label: "Type", options: ["Local", "Topic", "Buy & sell", "Events"] },
      { label: "Size", options: ["< 500", "500–5k", "5k+"] },
      { label: "Privacy", options: ["Public", "Private"] },
      { label: "Radius (local groups)", options: "range", rangeHint: "5 km – 50 km" },
    ],
  },
  business: {
    quick: ["Following", "Near me", "Hiring", "Verified"],
    defaultQuick: 1,
    scopeNote: "Businesses default to Near me — a shop 300 km away rarely matters unless it ships or hires remotely.",
    groups: [
      { label: "Category", options: ["Retail", "Services", "Workshops", "Studios", "Food"] },
      { label: "Radius", options: "range", rangeHint: "5 km – 50 km" },
      { label: "Open now", options: ["Yes", "Any"] },
      { label: "Rating", options: ["4.5★+", "4★+", "Any"] },
    ],
  },
  dating: {
    quick: ["Near me", "Shared groups", "New", "Active today"],
    defaultQuick: 0,
    scopeNote: "Dating is always distance-bound. Global is not offered; the radius slider is the main control.",
    groups: [
      { label: "Distance", options: "range", rangeHint: "5 km – 50 km" },
      { label: "Age", options: "range", rangeHint: "26 – 38" },
      { label: "Looking for", options: ["Long-term", "Short-term", "Friends", "Not sure"] },
      { label: "Common ground", options: ["Shared groups", "Shared events", "Traded before"] },
    ],
  },
  courses: {
    quick: ["Online", "Near me", "My learning", "Free"],
    defaultQuick: 0,
    scopeNote: "Courses default to Online (global). Near me switches to in-person classes and cohorts.",
    groups: [
      { label: "Format", options: ["Self-paced", "Live cohort", "In-person"] },
      { label: "Level", options: ["Beginner", "Intermediate", "Advanced"] },
      { label: "Price", options: "range", rangeHint: "€10 – €300" },
      { label: "Radius (in-person)", options: "range", rangeHint: "5 km – 50 km" },
      { label: "Topic", options: ["Crafts", "Business", "Repair", "Tech"] },
    ],
  },
  jobs: {
    quick: ["Near me", "Remote", "Slovakia", "Gigs"],
    defaultQuick: 0,
    scopeNote: "Jobs are Near me by default; Remote ignores distance entirely.",
    groups: [
      { label: "Radius", options: "range", rangeHint: "5 km – 50 km" },
      { label: "Type", options: ["Full-time", "Part-time", "Gig", "Internship"] },
      { label: "Pay", options: "range", rangeHint: "€900 – €2,000 / mo" },
      { label: "Posted", options: ["24 h", "7 d", "30 d"] },
      { label: "From", options: ["Verified businesses", "Any"] },
    ],
  },
};
