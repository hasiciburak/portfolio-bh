import HeroSection from "@/components/hero-section";
import MySkillsetSection from "@/components/my-skillset-section";
import WhyHireMeSection from "@/components/why-hire-me-section";

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col bg-zinc-950">
      <HeroSection variant="home" />
      <WhyHireMeSection />
      <MySkillsetSection />
    </div>
  );
}
