
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { OutfitShowcase } from "@/components/outfit-showcase"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Link } from "react-router-dom"
import { ButtonCustom } from "@/components/ui/button-custom"
import { Camera } from "lucide-react"

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      
      <main>
        <HeroSection />
        
        <div className="container mx-auto px-6 py-8 text-center">
          <Link to="/style-advice">
            <ButtonCustom variant="accent" className="rounded-full flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span>Try AI Style Assistant</span>
            </ButtonCustom>
          </Link>
        </div>
        
        <FeaturesSection />
        <OutfitShowcase />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
