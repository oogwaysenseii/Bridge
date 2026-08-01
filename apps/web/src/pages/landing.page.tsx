import * as React from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function LandingPage(): React.JSX.Element {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 text-center">
      <h1 className="max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        One identity. Every context.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Bridge connects what you sell, what you say, and who you know — under a single, trustworthy
        identity, instead of a different unverified stranger on every app.
      </p>
      <div className="flex gap-3">
        <Link to="/signup" className={cn(buttonVariants({ size: "lg" }))}>
          Get started
        </Link>
        <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
