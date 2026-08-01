import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./theme-provider";

function mockMatchMedia(prefersDark: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" && prefersDark,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as typeof window.matchMedia;
}

function ThemeProbe(): React.JSX.Element {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button
        onClick={() => {
          setTheme("dark");
        }}
      >
        Set dark
      </button>
      <button
        onClick={() => {
          setTheme("light");
        }}
      >
        Set light
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    mockMatchMedia(false);
  });

  it("defaults to the system theme when nothing is stored", () => {
    mockMatchMedia(true);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
  });

  it("applies the .dark class to <html> when the resolved theme is dark", () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByText("Set dark").click();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes the .dark class when switching back to light", () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByText("Set dark").click();
    });
    act(() => {
      screen.getByText("Set light").click();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists the chosen theme to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByText("Set dark"));

    expect(window.localStorage.getItem("bridge-theme")).toBe("dark");
  });

  it("throws when useTheme is called outside a ThemeProvider", () => {
    // Suppress the expected React error boundary console noise for this
    // one assertion.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<ThemeProbe />)).toThrow("useTheme must be used within a ThemeProvider");
    consoleError.mockRestore();
  });
});
