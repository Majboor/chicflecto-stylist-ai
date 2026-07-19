
import { ButtonCustom } from "./ui/button-custom"
import { ChevronRight, Wand2, Gem, LogIn } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useSubscription } from "@/hooks/useSubscription"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function HeroSection() {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const navigate = useNavigate()

  const handleAuthCheck = (path: string, e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Please sign in to access this feature");
      navigate("/auth");
      return
    }
    
    navigate(path);
  }

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-noise opacity-50 mix-blend-soft-light pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 h-96 w-96 animate-float rounded-full bg-fashion-accent/5 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-96 w-96 animate-float rounded-full bg-fashion-gold/10 blur-3xl [animation-delay:-3s]"></div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="group relative mb-8 inline-flex animate-fade-up items-center overflow-hidden rounded-full border border-fashion-accent/15 bg-white/70 px-4 py-1.5 shadow-soft backdrop-blur-sm">
            <span className="sheen" />
            {isPremium ? (
              <span className="flex items-center gap-1 text-xs font-medium">
                <Gem className="h-3.5 w-3.5 text-purple-500" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">Premium Access Unlocked</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-fashion-accent">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fashion-accent opacity-60"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-fashion-accent"></span>
                </span>
                AI-Powered Fashion Recommendations
              </span>
            )}
          </div>

          <h1 className="fashion-heading animate-fade-up text-4xl sm:text-5xl md:text-6xl mb-6">
            Elevate Your Style with
            <span className="relative">
              <span className="relative z-10 ml-2 mr-1 animate-gradient-pan bg-clip-text text-transparent [background-image:linear-gradient(100deg,theme(colors.fashion.accent),theme(colors.fashion.gold),theme(colors.fashion.accent))] [background-size:200%_auto]">AI</span>
              <span className="absolute bottom-2 left-0 z-0 h-3 w-full bg-fashion-gold/20"></span>
            </span>
            Fashion Expertise
          </h1>
          
          <p className="fashion-subheading animate-fade-up [--delay:100ms] mx-auto mt-6 max-w-2xl text-base sm:text-lg">
            {isPremium 
              ? "Enjoy unlimited personalized outfit recommendations and premium style insights tailored to your preferences."
              : "Discover personalized outfit recommendations, style advice, and fashion insights tailored specifically to your preferences and body type."}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up [--delay:200ms]">
            <ButtonCustom
              size="xl"
              className="group relative overflow-hidden rounded-full w-full sm:w-auto shadow-soft transition-shadow hover:shadow-gold-glow"
              variant="accent"
              onClick={(e) => handleAuthCheck("/style-advice", e)}
            >
              <span className="sheen" />
              <span>{isPremium ? "Get Premium Recommendations" : "Get Style Recommendations"}</span>
              {user ? (
                <Wand2 className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              ) : (
                <LogIn className="ml-2 h-4 w-4 transition-transform" />
              )}
            </ButtonCustom>
            
            <ButtonCustom 
              size="xl" 
              className="group rounded-full w-full sm:w-auto" 
              variant="outline"
              onClick={(e) => handleAuthCheck("/profile", e)}
            >
              <span>Create Style Profile</span>
              {user ? (
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              ) : (
                <LogIn className="ml-1 h-4 w-4" />
              )}
            </ButtonCustom>
          </div>
          
          {isPremium && (
            <div className="mt-6 animate-fade-up [--delay:300ms]">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
                <Gem className="h-3 w-3" />
                <span>Premium Member Benefits Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
