
import { HeroSection } from "@/components/hero-section"
import { HeroSectionB } from "@/components/hero-section-b"
import { FeaturesSection } from "@/components/features-section"
import { OutfitShowcase } from "@/components/outfit-showcase"
import { CTASection } from "@/components/cta-section"
import { useLandingVariant } from "@/hooks/use-variant"

const Index = () => {
  const variant = useLandingVariant()

  return (
    <div className="min-h-screen w-full bg-background font-sans">
      <main className="w-full">
        {variant === "b" ? <HeroSectionB /> : <HeroSection />}
        <FeaturesSection />
        <OutfitShowcase />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;
