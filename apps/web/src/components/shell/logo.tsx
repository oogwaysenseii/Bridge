import type { JSX } from "react";
import Link from "next/link";

export function Logo({ className }: { className?: string }): JSX.Element {
  return (
    <Link href="/feed" className={`font-display text-xl font-extrabold tracking-tight ${className ?? ""}`}>
      bri<span className="text-accent">dge</span>
    </Link>
  );
}
