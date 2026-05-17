import HeroSection from "@/components/hero-section";
import WhyHireMeSection from "@/components/why-hire-me-section";

export default function Home() {
  return (
    <div className="flex w-full flex-col bg-zinc-950">
      <HeroSection variant="home" />
      <WhyHireMeSection />
    </div>
  );
}
