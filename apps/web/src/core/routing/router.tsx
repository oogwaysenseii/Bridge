import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/layout/app-shell";
import { ProtectedRoute } from "@/core/routing/protected-route";
import { LandingPage } from "@/pages/landing.page";
import { LoginPage } from "@/pages/login.page";
import { SignupPage } from "@/pages/signup.page";
import { DashboardPage } from "@/pages/dashboard.page";

/**
 * Explicitly typed via ReturnType<typeof createBrowserRouter> rather than
 * left to inference. createBrowserRouter's return value is structurally
 * backed by @remix-run/router (a transitive dependency of react-router-dom,
 * not a direct one), and this is now a composite project (apps/web's
 * tsconfig.app.json) requiring declaration emit — TS has to write out
 * `router`'s full type into a .d.ts file, and can't name the internal
 * @remix-run/router type portably (TS2742). Annotating with
 * ReturnType<typeof createBrowserRouter> points the declaration at
 * react-router-dom's own exported function signature — a type this file
 * can actually name — instead of the internal type it wraps.
 */
export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "/dashboard", element: <DashboardPage /> }],
      },
    ],
  },
]);
