import type { JSX } from "react";
import type { Metadata } from "next";
import { ModulePage } from "@/components/shell/module-page";
import { FilterBar } from "@/components/module/filter-bar";
import { CourseCard, SectionHeading } from "@/components/module/cards";
import { AsideBox, AsideRow } from "@/components/shell/aside-box";
import { COURSES_CONTINUE, COURSES_POPULAR } from "@/modules/mock-data";

export const metadata: Metadata = { title: "Courses" };

/** Courses — Udemy-lite; sellers/businesses teach, lessons can sell the tools used. */
export default function CoursesPage(): JSX.Element {
  return (
    <ModulePage
      aside={
        <>
          <AsideBox title="Continue">
            <AsideRow seed="Wheel throwing basics" title="Wheel throwing basics" sub="Lesson 8 · Trimming" />
          </AsideBox>
          <AsideBox title="Live this week">
            <AsideRow seed="Q&A pricing" title="Q&A: pricing handmade" sub="Thu 19:00 · Zuza" />
          </AsideBox>
          <AsideBox title="Teach on Bridge">
            <p className="text-xs text-muted-foreground">
              Any seller or business page can publish a course. Learners can buy the tools straight from the lesson.
            </p>
          </AsideBox>
        </>
      }
    >
      <FilterBar module="courses" />
      <SectionHeading>Continue</SectionHeading>
      <div className="sm:grid sm:grid-cols-2 sm:gap-2.5">
        {COURSES_CONTINUE.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      <SectionHeading>Popular this week</SectionHeading>
      <div className="sm:grid sm:grid-cols-2 sm:gap-2.5">
        {COURSES_POPULAR.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </ModulePage>
  );
}
