import type { ModuleId } from "./registry";

/**
 * Sample data ported from the plaza-layout mock. This is a layout fixture —
 * every list here maps to an API surface the backend will grow module by
 * module (listings, posts, groups, threads, notifications, search).
 */

/* ---------------------------------- market --------------------------------- */

export type Freshness = "ok" | "stale" | "old";

export interface Listing {
  id: string;
  name: string;
  price: string;
  location: string;
  tag?: string;
  freshness: Freshness;
}

export const LISTINGS: Listing[] = [
  { id: "oak-side-table", name: "Oak side table", price: "€45", location: "Bratislava · 2 km", tag: "Handmade", freshness: "ok" },
  { id: "trek-fx-3", name: "Trek FX 3, 2022", price: "€520", location: "Petržalka · 5 km", freshness: "ok" },
  { id: "stoneware-mug-set", name: "Stoneware mug set", price: "€28", location: "Ships free", tag: "Handmade", freshness: "ok" },
  { id: "iphone-13", name: "iPhone 13, 128GB", price: "€390", location: "Ružinov · 3 km", freshness: "stale" },
  { id: "vintage-lamp", name: "Vintage lamp", price: "€60", location: "Trnava · 44 km", freshness: "stale" },
  { id: "kids-bike-20", name: 'Kids bike 20"', price: "€85", location: "Bratislava · 1 km", tag: "New", freshness: "ok" },
  { id: "teak-sideboard", name: "Teak sideboard", price: "€120", location: "Group price", freshness: "stale" },
  { id: "espresso-machine", name: "Espresso machine", price: "€140", location: "8 km", freshness: "old" },
  { id: "wool-rug", name: "Wool rug 2×3", price: "€75", location: "12 km", freshness: "stale" },
  { id: "camping-tent", name: "Camping tent 4p", price: "€55", location: "Zvolen · 18 km", freshness: "ok" },
  { id: "bosch-drill", name: "Bosch drill", price: "€40", location: "3 km", freshness: "old" },
  { id: "ceramic-vase", name: "Ceramic vase", price: "€22", location: "Ships free", tag: "Handmade", freshness: "ok" },
];

export interface ListingDetail {
  price: string;
  location: string;
  distance: string;
  condition: string;
  category: string;
  posted: string;
  views: number;
  saves: number;
  seller: string;
  sellerRating: string;
  /** Sellers sell as their main profile; ✓ = the account is verified. */
  verified: boolean;
  tags: string[];
  description: string;
  /**
   * Classifieds mode: all payment happens directly with the seller. The
   * `ship` flag stays in the model as the future door for in-app checkout
   * when shops/businesses sell through Bridge (Amazon-style, later).
   */
  delivery: { label: string; price: string; ship: boolean }[];
  crossPost?: string;
  availability: { state: Freshness; title: string; detail: string; refreshed: string };
}

const DEFAULT_DETAIL = (name: string): ListingDetail => ({
  price: "",
  location: "Bratislava",
  distance: "3 km",
  condition: "Used · good",
  category: "Marketplace",
  posted: "3 days ago",
  views: 61,
  saves: 4,
  seller: "Marek D.",
  sellerRating: "4.7★ · 12 sales",
  verified: false,
  tags: [],
  description: `${name}. Good condition, no known defects. Happy to answer questions or send more photos.`,
  delivery: [
    { label: "Pickup", price: "Free", ship: false },
    { label: "Courier · Slovakia", price: "€6.90", ship: true },
  ],
  availability: {
    state: "stale",
    title: "Not confirmed recently",
    detail: "Ask the seller — a confirmation updates this for everyone",
    refreshed: "Refreshed 9 d ago",
  },
});

export const LISTING_DETAILS: Record<string, ListingDetail> = {
  "oak-side-table": {
    price: "€45",
    location: "Bratislava – Staré Mesto",
    distance: "2 km",
    condition: "Used · good",
    category: "Furniture · Tables",
    posted: "2 days ago",
    views: 143,
    saves: 12,
    seller: "Zuza K.",
    sellerRating: "4.9★ · 58 sales",
    verified: true,
    tags: ["Handmade"],
    description:
      "Solid oak, hand-finished with hard-wax oil. 45×45×55 cm. Small mark on one leg (last photo). Made in my Trnava workshop, selling because I made two for a client and they took one.",
    delivery: [
      { label: "Pickup · Staré Mesto", price: "Free", ship: false },
      { label: "Courier · Slovakia", price: "€6.90", ship: true },
    ],
    crossPost: "Handmade ceramics · also posted here",
    availability: {
      state: "ok",
      title: "Confirmed available",
      detail: "Seller confirmed 2 h ago · to Marek's quick question",
      refreshed: "Refreshed 2 h ago",
    },
  },
  "trek-fx-3": {
    price: "€520",
    location: "Petržalka",
    distance: "5 km",
    condition: "Used · like new",
    category: "Bikes · Hybrid",
    posted: "6 h ago",
    views: 412,
    saves: 31,
    seller: "BikeShop Petržalka",
    sellerRating: "4.9★ · 312 sales · Business",
    verified: true,
    tags: ["Business", "Weekend price"],
    description:
      "Size M, one owner, serviced this week: new chain, cassette, brake pads. Includes rack and lights. Test rides in shop, Mon–Sat.",
    delivery: [
      { label: "Pickup · shop", price: "Free", ship: false },
      { label: "Courier · Slovakia", price: "€19", ship: true },
    ],
    crossPost: "Bratislava bikes · pinned in group",
    availability: {
      state: "ok",
      title: "Available · listed today",
      detail: "Auto-confirmed on posting",
      refreshed: "Posted 6 h ago",
    },
  },
  "stoneware-mug-set": {
    price: "€28",
    location: "Trnava",
    distance: "Ships free",
    condition: "New",
    category: "Handmade · Ceramics",
    posted: "1 day ago",
    views: 88,
    saves: 9,
    seller: "Zuza K.",
    sellerRating: "4.9★ · 58 sales",
    verified: true,
    tags: ["Handmade", "Ships free"],
    description:
      "Set of four, ~300 ml, slightly different glaze runs each. Dishwasher safe. From the batch in my latest reel.",
    delivery: [
      { label: "Courier · Slovakia", price: "Free", ship: true },
      { label: "Pickup · Trnava", price: "Free", ship: false },
    ],
    availability: {
      state: "ok",
      title: "Available · 3 sets left",
      detail: "Stock updated 1 day ago",
      refreshed: "Refreshed 1 d ago",
    },
  },
};

/** Seller assignment for listings without a full detail entry, so "More from this seller" has content. */
const LISTING_SELLERS: Record<string, string> = {
  "ceramic-vase": "Zuza K.",
  "vintage-lamp": "Lenka S.",
  "teak-sideboard": "Lenka S.",
  "kids-bike-20": "BikeShop Petržalka",
  "iphone-13": "Tomáš K.",
  "espresso-machine": "Anna P.",
  "wool-rug": "Anna P.",
};

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function getListingDetail(id: string): ListingDetail {
  const listing = getListing(id);
  const detail = LISTING_DETAILS[id] ?? DEFAULT_DETAIL(listing?.name ?? id);
  const seller = LISTING_SELLERS[id];
  return { ...detail, ...(seller ? { seller } : {}), price: detail.price || (listing?.price ?? "") };
}

/** "Can you do €X?" quick-question amount: ≈ −10%, rounded to €5. */
export function offerPrice(price: string): string {
  const n = Number.parseInt(price.replace(/\D/g, ""), 10) || 0;
  return `€${Math.round((n * 0.9) / 5) * 5}`;
}

/* ---------------------------------- posts ---------------------------------- */

export interface Post {
  id: string;
  author: string;
  handle: string;
  verified?: boolean;
  time: string;
  text: string;
  /** Quote-post of a listing (listing id). */
  quoteListing?: string;
  image?: boolean;
  likes: number;
  replies: number;
  reposts: number;
}

export const POSTS: Post[] = [
  { id: "p1", author: "Zuza K.", handle: "@zuzak", time: "2h", text: "Six mugs, all slightly different. Kiln day is the best day of the week.", likes: 14, replies: 3, reposts: 1 },
  { id: "p2", author: "Marek D.", handle: "@marekd", time: "3h", text: "Anyone know how to strip 70s lacquer without ruining the veneer? Asking for a sideboard.", likes: 6, replies: 9, reposts: 0 },
  { id: "p3", author: "BikeShop Petržalka", handle: "@bikeshoppetrzalka", verified: true, time: "4h", text: "Weekend price on the FX 3. Tuned, ready, one owner.", quoteListing: "trek-fx-3", likes: 22, replies: 2, reposts: 5 },
  { id: "p4", author: "Lenka S.", handle: "@lenkas", time: "5h", text: "Reposted Marek D. · Try denatured alcohol first, veneer survives it. Sanding kills it.", likes: 31, replies: 4, reposts: 7 },
  { id: "p5", author: "Roman's Records", handle: "@romansrecords", verified: true, time: "7h", text: "200 new LPs in Saturday. Crate digging starts at 9. Coffee is free, opinions are not.", likes: 40, replies: 11, reposts: 3 },
  { id: "p6", author: "Studio Lipa", handle: "@studiolipa", verified: true, time: "1d", text: "We're hiring a product photographer. Freelance, remote, phone-only shooters welcome. Details in Jobs.", likes: 9, replies: 1, reposts: 4 },
  { id: "p7", author: "Anna P.", handle: "@annap", time: "1d", text: "Selling my glaze seconds tonight. Slight runs, perfect for daily use.", image: true, likes: 17, replies: 2, reposts: 1 },
  { id: "p8", author: "Tomáš K.", handle: "@tomask", time: "2d", text: "Bridge idea: let groups pin a listing to the top for 24h. Swap-meet season needs it.", likes: 52, replies: 18, reposts: 6 },
];

/* ----------------------------------- feed ---------------------------------- */

export interface DigestItem {
  id: string;
  module: string;
  who: string;
  what: string;
  cta: string;
  listing?: string;
  media?: string;
  promo?: boolean;
}

export const DIGEST: DigestItem[] = [
  { id: "d1", module: "Marketplace", who: "BikeShop Petržalka", what: "listed 2 new bikes", cta: "Open", listing: "trek-fx-3" },
  { id: "d2", module: "Groups", who: "Vintage furniture SK", what: "12 new posts · Lenka: teak sideboard is yours", cta: "Open group" },
  { id: "d3", module: "Jobs", who: "BikeShop Petržalka", what: "replied to your application — trial shift Tuesday", cta: "Open thread" },
  { id: "d4", module: "Posts", who: "Zuza K.", what: '"Six mugs, all slightly different. Kiln day is the best day."', cta: "Reply" },
  { id: "d5", module: "Reels", who: "Lenka S.", what: "posted a reel · Teak sideboard: sanding day", cta: "Watch", media: "Teak sideboard: sanding day" },
  { id: "d6", module: "Courses", who: "Ceramics by Zuza", what: "lesson 9 is out · Wheel throwing basics", cta: "Continue · 62%" },
  { id: "d7", module: "Business", who: "Kaviareň Podpoľanie", what: "is open now · 2 km", cta: "View page" },
  { id: "d8", module: "Discovery · Marketplace", who: "Near you", what: '3 new listings match your saved search "oak table"', cta: "See all", listing: "oak-side-table", promo: true },
  { id: "d9", module: "Promoted · Courses", who: "Bridge Academy", what: "Start selling on Bridge — free 4-lesson course", cta: "Start", promo: true },
];

/* ---------------------------------- reels ---------------------------------- */

export interface Reel {
  id: string;
  author: string;
  caption: string;
  productName: string;
  productCta: string;
  likes: string;
  comments: string;
}

export const REELS: Reel[] = [
  { id: "r1", author: "Ceramics by Zuza", caption: "Trimming the foot on a fresh mug 🔊", productName: "Stoneware mug set", productCta: "€28 · Buy", likes: "1.2k", comments: "84" },
  { id: "r2", author: "BikeShop Petržalka", caption: "Bike fit in 60 seconds", productName: "Trek FX 3", productCta: "€520 · Buy", likes: "860", comments: "41" },
  { id: "r3", author: "Lenka S.", caption: "Teak sideboard: sanding day", productName: "Follow the restore", productCta: "Vintage furniture SK", likes: "2.1k", comments: "132" },
  { id: "r4", author: "Roman's Records", caption: "Sound check: 1974 Prima pressing", productName: "Prima LP", productCta: "€35 · Buy", likes: "540", comments: "27" },
];

/* ---------------------------------- groups --------------------------------- */

export interface Group {
  id: string;
  name: string;
  detail: string;
  joined?: boolean;
}

export const GROUPS_YOURS: Group[] = [
  { id: "g1", name: "Vintage furniture SK", detail: "4.8k members · 12 new posts · Lenka: teak sideboard", joined: true },
  { id: "g2", name: "Bratislava bikes", detail: "2.4k members · 3 new listings", joined: true },
  { id: "g3", name: "Handmade ceramics", detail: "1.2k members · quiet today", joined: true },
];

export const GROUPS_NEAR: Group[] = [
  { id: "g4", name: "Detva bazár", detail: "1.1k members · 3 km" },
  { id: "g5", name: "Zvolen garage sales", detail: "2.1k members · 18 km" },
  { id: "g6", name: "Podpoľanie hikers", detail: "640 members · events weekly" },
];

export const GROUPS_SUGGESTED: Group[] = [
  { id: "g7", name: "Espresso at home SK", detail: "3.4k members" },
  { id: "g8", name: "Vinyl collectors", detail: "980 members" },
  { id: "g9", name: "Small business SK", detail: "5.2k members" },
];

/* --------------------------------- business -------------------------------- */

export interface Business {
  id: string;
  name: string;
  detail: string;
  tag?: string;
}

export const BUSINESSES: Business[] = [
  { id: "b1", name: "BikeShop Petržalka", detail: "Retail · 4.9★ · 5 km", tag: "Hiring" },
  { id: "b2", name: "Studio Lipa", detail: "Interior design · 4.7★ · 12 km" },
  { id: "b3", name: "Ceramics by Zuza", detail: "Workshop · 5.0★ · Trnava", tag: "Courses" },
  { id: "b4", name: "Roman's Records", detail: "Retail · Košice" },
  { id: "b5", name: "Cyklo Bazár BA", detail: "Repairs · 4.6★ · 9 km", tag: "Hiring" },
  { id: "b6", name: "Kaviareň Podpoľanie", detail: "Café · 4.8★ · 2 km", tag: "Open now" },
  { id: "b7", name: "Wheelworks", detail: "Repairs · 4.5★" },
];

/* ---------------------------------- dating --------------------------------- */

export interface DatingProfile {
  id: string;
  name: string;
  age: number;
  distance: string;
  interests: string;
  tags: string[];
}

export const DATING_PROFILES: DatingProfile[] = [
  { id: "n1", name: "Nina", age: 29, distance: "4 km", interests: "Ceramics · Cycling", tags: ["2 shared groups", "Going to swap meet"] },
  { id: "n2", name: "Tomáš", age: 31, distance: "8 km", interests: "Cyclist · Coffee", tags: ["Traded with you"] },
  { id: "n3", name: "Eva", age: 27, distance: "15 km", interests: "Vinyl · Hiking", tags: ["1 shared group"] },
];

/* ---------------------------------- courses -------------------------------- */

export interface Course {
  id: string;
  title: string;
  by: string;
  progress?: string;
  price: string;
}

export const COURSES_CONTINUE: Course[] = [
  { id: "c1", title: "Wheel throwing basics", by: "Ceramics by Zuza · 12 lessons", progress: "62%", price: "€29" },
  { id: "c2", title: "Bike maintenance at home", by: "BikeShop Petržalka · 8 lessons", progress: "15%", price: "Free" },
];

export const COURSES_POPULAR: Course[] = [
  { id: "c3", title: "Photos that convert", by: "Bridge Academy · 5 lessons", price: "Free" },
  { id: "c4", title: "Restoring mid-century furniture", by: "Vintage furniture SK · live cohort", price: "€49" },
  { id: "c5", title: "Home espresso: dial in", by: "Kaviareň Podpoľanie · in person", price: "€15" },
  { id: "c6", title: "Start selling on Bridge", by: "Bridge Academy · 4 lessons", price: "Free" },
  { id: "c7", title: "Intro to vinyl care", by: "Roman's Records", price: "€9" },
  { id: "c8", title: "Product photography, phone only", by: "Studio Lipa", price: "€19" },
];

/* ----------------------------------- jobs ----------------------------------- */

export interface Job {
  id: string;
  title: string;
  detail: string;
  pay: string;
}

export const JOBS: Job[] = [
  { id: "j1", title: "Bike mechanic", detail: "BikeShop Petržalka · Bratislava · Full-time", pay: "€1,400–1,700/mo" },
  { id: "j2", title: "Ceramics studio assistant", detail: "Ceramics by Zuza · Trnava · Part-time", pay: "€9/h" },
  { id: "j3", title: "Delivery driver (weekends)", detail: "Cyklo Bazár BA · Gig", pay: "€60/day" },
  { id: "j4", title: "Product photographer", detail: "Studio Lipa · Remote · Freelance", pay: "€250/shoot" },
  { id: "j5", title: "Barista", detail: "Kaviareň Podpoľanie · Detva · Part-time", pay: "€7/h" },
  { id: "j6", title: "Warehouse helper", detail: "Detva bazár · Gig · Saturday", pay: "€50/day" },
  { id: "j7", title: "Web content editor", detail: "Small business SK · Remote", pay: "€900/mo" },
  { id: "j8", title: "Furniture restorer", detail: "Lenka S. · Zvolen · Contract", pay: "€15/h" },
  { id: "j9", title: "Course video editor", detail: "Bridge Academy · Remote", pay: "€300/course" },
];

/* --------------------------------- messages --------------------------------- */

export interface Thread {
  who: string;
  preview: string;
  context: string;
  unread: boolean;
}

/**
 * Messages are per module: almost every module has its own profile, so it
 * has its own inbox (a Marketplace thread carries the listing + price,
 * Dating shows matches, Jobs shows recruiter threads…).
 */
export const MESSAGES: Record<ModuleId, Thread[]> = {
  feed: [{ who: "Bridge", preview: "Welcome — messages are per module. Pick an inbox above.", context: "system", unread: false }],
  posts: [
    { who: "Zuza K.", preview: "Thanks for the comment on the glaze post 🙌", context: "post", unread: true },
    { who: "Roman's Records", preview: "Sent you a photo", context: "dm", unread: false },
    { who: "Lenka S.", preview: "Loved your kiln reel", context: "post", unread: false },
  ],
  reels: [
    { who: "Ceramics by Zuza", preview: "Replied to your reel comment", context: "reel", unread: true },
    { who: "BikeShop Petržalka", preview: "Tagged you in a reel", context: "reel", unread: false },
  ],
  market: [
    { who: "Marek D.", preview: "Is the oak table still available?", context: "€45 · Oak side table", unread: true },
    { who: "BikeShop Petržalka", preview: "We can hold the Trek till Saturday", context: "€520 · Trek FX 3", unread: true },
    { who: "Anna P.", preview: "Shipped! Tracking inside", context: "€28 · Mug set", unread: false },
  ],
  groups: [
    { who: "Vintage furniture SK", preview: "Lenka: teak sideboard is yours if you want it", context: "group chat", unread: true },
    { who: "Bratislava bikes", preview: "12 new messages", context: "group chat", unread: false },
    { who: "Handmade ceramics", preview: "Admin: swap meet details", context: "group chat", unread: false },
  ],
  business: [
    { who: "Studio Lipa", preview: "Quote request: 4 product shots", context: "B2B", unread: true },
    { who: "Cyklo Bazár BA", preview: "Interested in a bulk order", context: "B2B", unread: false },
  ],
  dating: [
    { who: "Nina, 29", preview: '"Saw you at the swap meet post — going?"', context: "match", unread: true },
    { who: "Tomáš, 31", preview: "Still riding that Trek?", context: "match", unread: false },
  ],
  courses: [
    { who: "Zuza (instructor)", preview: "Feedback on your lesson 8 upload", context: "Wheel throwing", unread: true },
    { who: "Bridge Academy", preview: "Live Q&A starts Thu 19:00", context: "announcement", unread: false },
  ],
  jobs: [
    { who: "BikeShop Petržalka", preview: "Can you come in Tuesday for a trial shift?", context: "Bike mechanic", unread: true },
    { who: "Studio Lipa", preview: "We received your application", context: "Photographer", unread: false },
  ],
};

export function unreadCount(module: ModuleId): number {
  return MESSAGES[module].filter((t) => t.unread).length;
}

export function totalUnread(): number {
  return Object.values(MESSAGES).reduce((sum, threads) => sum + threads.filter((t) => t.unread).length, 0);
}

/* ------------------------------- notifications ------------------------------ */

export interface Notification {
  text: string;
  meta: string;
  module: string;
  unread: boolean;
}

export const NOTIFICATIONS: Notification[] = [
  { text: "Marek D. asked about your oak table", meta: "Marketplace · 2 min", module: "market", unread: true },
  { text: "Nina liked you back — it's a match", meta: "Dating · 20 min", module: "dating", unread: true },
  { text: "BikeShop Petržalka replied to your application", meta: "Jobs · 1 h", module: "jobs", unread: true },
  { text: "Zuza posted lesson 9 in Wheel throwing", meta: "Courses · 3 h", module: "courses", unread: false },
  { text: "Vintage furniture SK: 12 new posts", meta: "Groups · 5 h", module: "groups", unread: false },
  { text: "Your reel passed 4k plays", meta: "Reels · yesterday", module: "reels", unread: false },
  { text: "Studio Lipa started following you", meta: "Business · yesterday", module: "business", unread: false },
  { text: "Order #4821 delivered — leave a review", meta: "Marketplace · 2 d", module: "market", unread: false },
];

/* ---------------------------------- search ---------------------------------- */

export interface SearchResult {
  title: string;
  detail: string;
  distance: string;
  global?: boolean;
}

export interface SearchGroup {
  module: ModuleId | "posts";
  label: string;
  results: SearchResult[];
}

export const SEARCH_QUERY = "trek";

export const SEARCH_GROUPS: SearchGroup[] = [
  {
    module: "market",
    label: "Marketplace",
    results: [
      { title: "Trek FX 3, 2022", detail: "€520 · BikeShop Petržalka", distance: "5 km" },
      { title: "Trek Marlin 7", detail: "€610 · private seller", distance: "Zvolen · 18 km" },
      { title: "Trek saddle, new", detail: "€25", distance: "ships · Košice", global: true },
    ],
  },
  {
    module: "groups",
    label: "Groups",
    results: [
      { title: "Bratislava bikes", detail: "2.4k members · 3 posts about Trek", distance: "12 km" },
      { title: "Trek riders SK", detail: "410 members", distance: "Slovakia", global: true },
    ],
  },
  { module: "reels", label: "Reels", results: [{ title: "Bike fit in 60 seconds", detail: "BikeShop Petržalka", distance: "4 km" }] },
  {
    module: "business",
    label: "Business",
    results: [
      { title: "BikeShop Petržalka", detail: "Retail · 4.9★", distance: "5 km" },
      { title: "Trek Store Wien", detail: "Retail", distance: "Global", global: true },
    ],
  },
  { module: "jobs", label: "Jobs", results: [{ title: "Bike mechanic", detail: "BikeShop Petržalka · €1.4–1.7k", distance: "5 km" }] },
  { module: "courses", label: "Courses", results: [{ title: "Bike maintenance at home", detail: "BikeShop · Free", distance: "online", global: true }] },
  {
    module: "posts",
    label: "People & posts",
    results: [
      { title: "Marek D.", detail: '"Anyone ridden the new Trek FX?"', distance: "Detva" },
      { title: "Tomáš, 31", detail: "Cyclist · 2 shared groups", distance: "8 km" },
    ],
  },
];

/* --------------------------------- identity --------------------------------- */

export type LinkState = "linked" | "unlinked" | "none";

/**
 * Identity model: the main profile is shared by Feed, Posts, Reels,
 * Marketplace and Groups. Business, Dating, Courses and Jobs need a separate
 * profile the user activates and fills in when needed — each optionally
 * linked to the main profile to inherit its ✓ and history for trust.
 */
export const PROFILE_LINKS: Partial<Record<ModuleId, LinkState>> = {
  business: "none",
  dating: "unlinked",
  courses: "linked",
  jobs: "unlinked",
};

export const CURRENT_USER = {
  name: "Jakub M.",
  handle: "@jakubm",
  town: "Detva",
  followers: 412,
  following: 380,
  groups: 3,
};
