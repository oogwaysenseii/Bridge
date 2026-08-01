import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Design tokens for Bridge — see docs/VISION.md ("Premium. Minimal. Fast.")
 * Palette: a cool graphite neutral base (not the generic warm-cream-plus-
 * terracotta or near-black-plus-acid-green defaults) with a single
 * signature accent — an indigo-violet, chosen to read as "connection"
 * without being a generic SaaS blue. Named here as actual values so future
 * phases don't invent new ad hoc colors.
 *
 *   --accent:      #5B5FEF  (signature — links, primary actions, focus rings)
 *   --accent-ink:  #FFFFFF  (text on accent)
 *   light bg:      #FAFAF9  ink: #16181D
 *   dark  bg:      #0B0D12  ink: #F4F5F7
 *
 * Type: Space Grotesk (display/headings, used with restraint — weights
 * 500-700 only) paired with Inter (body/UI, highly legible at small sizes)
 * and JetBrains Mono (utility — timestamps, IDs, code-like data).
 */
const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [animate],
};

export default config;
