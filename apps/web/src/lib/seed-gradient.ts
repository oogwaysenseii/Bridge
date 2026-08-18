import type { CSSProperties } from "react";

/**
 * Deterministic placeholder visuals, same trick as the plaza-layout mock:
 * hash the seed for a fallback gradient, and map recognizable keywords in
 * the seed to curated Unsplash photos (plain CDN URLs, no API key) for
 * immersion. Seeds ending in "av" (avatars) and seeds containing "portrait"
 * draw from a portrait pool by hash. Real assets replace this later.
 */

const U = (id: string, w = 800): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${String(w)}&q=60`;

const PORTRAITS: string[] = [
  U("photo-1494790108377-be9c29b29330", 400),
  U("photo-1507003211169-0a1dd7228f2d", 400),
  U("photo-1438761681033-6461ffad8d80", 400),
  U("photo-1500648767791-00dcc994a43e", 400),
  U("photo-1544005313-94ddf0286df2", 400),
  U("photo-1506794778202-cad84cf45f1d", 400),
];

const PHOTOS: [RegExp, string][] = [
  [/bike|trek|cyklo|wheelworks|mechanic/i, U("photo-1485965120184-e220f721d03e")],
  [/mug|stoneware|ceramic|vase|glaze|kiln|pottery|throwing|plates/i, U("photo-1493106819501-66d381c466f1")],
  [/table|oak|sideboard|teak|furniture|restor/i, U("photo-1555041469-a586c61ea9bc")],
  [/lamp/i, U("photo-1507473885765-e6ed057f782c")],
  [/iphone|phone/i, U("photo-1511707171634-5f897ff02aa9")],
  [/espresso|coffee|kaviare|barista/i, U("photo-1495474472287-4d71bcdd2085")],
  [/vinyl|records|lp|prima/i, U("photo-1483412033650-1015ddeb83d1")],
  [/tent|camping|hik/i, U("photo-1504280390367-361c6d9f38f4")],
  [/drill|tool|warehouse/i, U("photo-1504148455328-c376907d081c")],
  [/rug|wool/i, U("photo-1600166898405-da9535204843")],
  [/photo|studio|camera|lipa/i, U("photo-1516035069371-29a1b244cc32")],
  [/garage|bazár|bazar|swap/i, U("photo-1441986300917-64674bd600d8")],
];

export function seedHue(seed: string): number {
  let hue = 0;
  for (const char of seed) hue = (hue * 31 + char.charCodeAt(0)) % 360;
  return hue;
}

function pickPhoto(seed: string): string | undefined {
  if (/av$/.test(seed) || /portrait/i.test(seed)) {
    return PORTRAITS[seedHue(seed) % PORTRAITS.length];
  }
  for (const [pattern, url] of PHOTOS) {
    if (pattern.test(seed)) return url;
  }
  return undefined;
}

/**
 * Background style for a seed: matched photo layered over the hashed
 * gradient (which shows while loading / if no keyword matches). Pass
 * `overlay` to darken the photo for white text on top (reels, dating).
 */
export function seedGradient(seed: string, overlay?: boolean): CSSProperties {
  const a = seedHue(seed);
  const b = (a + 40) % 360;
  const gradient = `linear-gradient(135deg, hsl(${String(a)} 45% 72%), hsl(${String(b)} 40% 45%))`;
  const photo = pickPhoto(seed);
  const layers = [
    overlay ? "linear-gradient(180deg, rgba(0,0,0,.1) 35%, rgba(0,0,0,.72))" : undefined,
    photo ? `url('${photo}')` : undefined,
    gradient,
  ].filter(Boolean);
  return {
    backgroundImage: layers.join(", "),
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
