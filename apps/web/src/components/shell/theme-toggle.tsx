"use client";

import type { JSX } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/core/theme/theme-provider";

/** Light/dark switch. Light is the default; dark is opt-in. */
export function ThemeToggle({ withLabel }: { withLabel?: boolean }): JSX.Element {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        setTheme(isDark ? "light" : "dark");
      }}
      className={
        withLabel
          ? "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium hover:bg-muted"
          : "rounded-lg p-2.5 transition-colors hover:bg-muted"
      }
    >
      {isDark ? <Sun className="size-5" strokeWidth={1.8} /> : <Moon className="size-5" strokeWidth={1.8} />}
      {withLabel && (isDark ? "Light mode" : "Dark mode")}
    </button>
  );
}
