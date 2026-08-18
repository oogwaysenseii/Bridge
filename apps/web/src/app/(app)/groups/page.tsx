import type { JSX } from "react";
import type { Metadata } from "next";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { GroupCard, SectionHeading } from "@/components/module/cards";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { GROUPS_YOURS, GROUPS_NEAR, GROUPS_SUGGESTED } from "@/modules/mock-data";

export const metadata: Metadata = { title: "Groups" };

/** Groups — local (town) and topical communities, with buy/sell tabs later. */
export default function GroupsPage(): JSX.Element {
  return (
    <ModulePage
      aside={
        <>
          <AsideBox title="About groups">
            <p className="text-xs text-muted-foreground">
              Groups can be local (a town) or topical (nation-wide). Buy &amp; sell tabs live inside each group.
            </p>
          </AsideBox>
          <AsideBox title="Upcoming">
            <AsideRow seed="Swap meet" title="Swap meet · Trnava" sub="Sat 24 Aug" />
          </AsideBox>
        </>
      }
    >
      <FilterBar module="groups" />
      <SectionHeading>Your groups</SectionHeading>
      {GROUPS_YOURS.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
      <SectionHeading>Near you</SectionHeading>
      {GROUPS_NEAR.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
      <SectionHeading>Suggested</SectionHeading>
      {GROUPS_SUGGESTED.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </ModulePage>
  );
}
