import { redirect } from "next/navigation";

/** Messages are per module; open the busiest inbox by default. */
export default function MessagesIndexPage(): never {
  redirect("/messages/market");
}
