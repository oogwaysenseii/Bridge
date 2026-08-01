import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/layout/theme-toggle";
import { useSession, signOut } from "@/core/auth/auth-client";
import { cn } from "@/lib/cn";

/**
 * The bridge glyph — two nodes connected by a line — is Bridge's one
 * signature visual element (see docs/VISION.md and the frontend-design
 * guidance: spend boldness in one restrained place). Used consistently as
 * the brand mark; not repeated elsewhere as decoration.
 */
function BridgeMark(): React.JSX.Element {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="5" cy="16" r="3" className="fill-accent" />
      <circle cx="17" cy="6" r="3" className="fill-accent" />
      <path d="M7.5 14 14.5 8" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
    </svg>
  );
}

export function Header(): React.JSX.Element {
  const { data: session } = useSession();
  const navigate = useNavigate();

  async function handleSignOut(): Promise<void> {
    await signOut();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <BridgeMark />
          Bridge
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <>
              <Link to="/dashboard" className={cn(buttonVariants({ variant: "ghost" }))}>
                Dashboard
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  void handleSignOut();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
                Sign in
              </Link>
              <Link to="/signup" className={cn(buttonVariants())}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
