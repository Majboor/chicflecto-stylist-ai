
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { OutfitShowcase } from "@/components/outfit-showcase"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <OutfitShowcase />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
