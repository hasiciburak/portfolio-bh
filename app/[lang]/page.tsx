import AvailabilityStatusSection from "@/components/availability-status-section";
import { HomeSectionIndex } from "@/components/home-section-index";
import HeroSection from "@/components/hero-section";
import MySkillsetSection from "@/components/my-skillset-section";
import ProofMetricsSection from "@/components/proof-metrics-section";
import ServicesSection from "@/components/services-section";
import WorkExperienceSection from "@/components/work-experience-section";
import WhyHireMeSection from "@/components/why-hire-me-section";

const Home = () => {
  return (
    <div className="flex w-full flex-1 flex-col bg-background">
      <HomeSectionIndex />
      <HeroSection variant="home" />
      {/* Availability first — it gates everything — then the numbers make the case. */}
      <AvailabilityStatusSection />
      <ProofMetricsSection />
      <WhyHireMeSection />
      <ServicesSection />
      <MySkillsetSection />
      <WorkExperienceSection />
    </div>
  );
};

export default Home;
