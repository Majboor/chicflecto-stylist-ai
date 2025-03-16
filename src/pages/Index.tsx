
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { OutfitShowcase } from "@/components/outfit-showcase"
import { CTASection } from "@/components/cta-section"

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-background font-sans">
      <main className="w-full">
        <HeroSection />
        <FeaturesSection />
        <OutfitShowcase />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;
