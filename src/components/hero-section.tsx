
import { ButtonCustom } from "./ui/button-custom"
import { ChevronRight, Wand2 } from "lucide-react"
import { Link } from "react-router-dom"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-noise opacity-50 mix-blend-soft-light pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-fashion-accent/5 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-fashion-accent/10 blur-3xl"></div>
      
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-fashion-light px-4 py-1.5">
            <span className="text-xs font-medium text-fashion-accent">✨ AI-Powered Fashion Recommendations</span>
          </div>
          
          <h1 className="fashion-heading animate-fade-up text-4xl sm:text-5xl md:text-6xl mb-6">
            Elevate Your Style with
            <span className="relative">
              <span className="relative z-10 ml-2 mr-1 text-fashion-accent">AI</span>
              <span className="absolute bottom-2 left-0 z-0 h-3 w-full bg-fashion-accent/20"></span>
            </span>
            Fashion Expertise
          </h1>
          
          <p className="fashion-subheading animate-fade-up [--delay:100ms] mx-auto mt-6 max-w-2xl text-base sm:text-lg">
            Discover personalized outfit recommendations, style advice, and fashion insights
            tailored specifically to your preferences and body type.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up [--delay:200ms]">
            <Link to="/style-advice">
              <ButtonCustom size="xl" className="group rounded-full" variant="accent">
                <span>Get Style Recommendations</span>
                <Wand2 className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              </ButtonCustom>
            </Link>
            
            <Link to="/profile">
              <ButtonCustom size="xl" variant="outline" className="group rounded-full">
                <span>Create Style Profile</span>
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonCustom>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
