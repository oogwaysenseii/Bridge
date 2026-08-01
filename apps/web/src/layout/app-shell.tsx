import * as React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/layout/header";

export function AppShell(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
