import { HomeSectionIndex } from "@/components/home-section-index";
import HeroSection from "@/components/hero-section";
import MySkillsetSection from "@/components/my-skillset-section";
import GithubGraphSection from "@/components/github-graph-section";
import WorkExperienceSection from "@/components/work-experience-section";
import WhyHireMeSection from "@/components/why-hire-me-section";

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col bg-background">
      <HomeSectionIndex />
      <HeroSection variant="home" />
      <WhyHireMeSection />
      <MySkillsetSection />
      <WorkExperienceSection />
      <GithubGraphSection />
    </div>
  );
}
