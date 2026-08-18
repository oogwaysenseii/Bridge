import type { ReactNode, JSX } from "react";
import { Logo } from "@/components/shell/logo";

/** Auth screens sit outside the app shell — just the logo and a centered card. */
export default function AuthLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">{children}</main>
    </div>
  );
}
