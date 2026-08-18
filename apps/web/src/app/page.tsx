import { redirect } from "next/navigation";

/** The app opens on Feed — the cross-module digest (BRIDGE-brief §1). */
export default function RootPage(): never {
  redirect("/feed");
}
