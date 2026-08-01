import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/core/theme/theme-provider";

/**
 * A closed mapping (every Theme key present) rather than array + modulo
 * indexing. `noUncheckedIndexedAccess` can never prove a computed array
 * index is in-bounds, so `THEME_CYCLE[i % THEME_CYCLE.length]` always
 * infers as `Theme | undefined` — the previous version needed `!` (or an
 * `as` cast before that) to force past that. Indexing a `Record<Theme,
 * Theme>` with a value already typed as `Theme` has no such gap: since
 * `Theme` is a closed union of string literals (not an open `string`
 * index signature) and every member has an entry below, TypeScript proves
 * `NEXT_THEME[theme]` is always `Theme`, never `Theme | undefined` — no
 * assertion of any kind needed.
 */
const NEXT_THEME: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const ICON_BY_THEME = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  const Icon = ICON_BY_THEME[theme];

  function cycleTheme(): void {
    setTheme(NEXT_THEME[theme]);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Switch theme, currently ${theme}`}
      title={`Theme: ${theme}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
