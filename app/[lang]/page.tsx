import { notFound } from "next/navigation";

import { HomeSectionIndex } from "@/components/home-section-index";
import HeroSection from "@/components/hero-section";
import MySkillsetSection from "@/components/my-skillset-section";
import ProjectsSection from "@/components/projects-section";
import ServicesSection from "@/components/services-section";
import WorkExperienceSection from "@/components/work-experience-section";
import WhyHireMeSection from "@/components/why-hire-me-section";
import { hasLocale, type Locale } from "@/app/[lang]/dictionaries";
import { getProjectListItems } from "@/lib/project-content";
import { projectsHref } from "@/lib/projects";

/**
 * The home page needed no `params` until the projects excerpt arrived: case-study
 * names and summaries come from per-locale MDX, so the list has to be built for
 * the language being rendered.
 */
const HOME_PROJECT_LIMIT = 3;

const Home = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const projects = await getProjectListItems(lang as Locale, HOME_PROJECT_LIMIT);

  return (
    <div className="flex w-full flex-1 flex-col bg-background">
      <HomeSectionIndex />
      <HeroSection variant="home" />
      {/* Availability and the proof numbers both ride inside the hero now. */}
      <WhyHireMeSection />
      <ServicesSection />
      {/*
        Straight after Services on purpose: that section says what I can be hired
        for, this one shows something already built. Claim, then evidence — rather
        than leaving the only case study reachable from the nav alone, which a
        scrolling visitor never opens.
      */}
      <ProjectsSection
        projects={projects}
        variant="home"
        allProjectsHref={projectsHref(lang)}
      />
      <MySkillsetSection />
      <WorkExperienceSection />
    </div>
  );
};

export default Home;
