import type { JSX } from "react";
import type { Metadata } from "next";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { JobCard } from "@/components/module/cards";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { JOBS } from "@/modules/mock-data";

export const metadata: Metadata = { title: "Jobs" };

/** Jobs — posted by Business pages; full-time to gigs. */
export default function JobsPage(): JSX.Element {
  return (
    <ModulePage
      aside={
        <>
          <AsideBox title="Your job profile">
            <AsideRow seed="open-to" title="Open to: part-time, gigs" sub="Visible to verified businesses" />
            <AsideRow seed="skills" title="Skills from courses" sub="2 certificates" />
          </AsideBox>
          <AsideBox title="Post a job">
            <p className="mb-2 text-xs text-muted-foreground">
              Business pages post here; listings also appear on the company page and in relevant groups.
            </p>
            <button type="button" className="w-full rounded-full bg-foreground py-1.5 text-xs font-semibold text-card">
              Post a job
            </button>
          </AsideBox>
        </>
      }
    >
      <FilterBar module="jobs" />
      {JOBS.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </ModulePage>
  );
}
