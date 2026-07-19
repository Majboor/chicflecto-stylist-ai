import { ButtonCustom } from "./ui/button-custom"
import { ArrowRight, Sparkles, Gem, LogIn, Star } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useSubscription } from "@/hooks/useSubscription"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

/**
 * Hero — Variant B (experimental).
 *
 * A deliberately different take on the landing hero for A/B testing:
 *  - Split, left-aligned layout instead of the centered control.
 *  - Benefit-led headline ("Your wardrobe, reimagined by AI") vs the
 *    control's "Elevate Your Style with AI Fashion Expertise".
 *  - Primary CTA copy is action-first ("Style me now") with a social-proof
 *    trust row underneath.
 *
 * Rendered only when the URL carries ?variant=b (see useLandingVariant).
 * Kept as a standalone component so the control hero stays untouched.
 */
export function HeroSectionB() {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const navigate = useNavigate()

  const handleAuthCheck = (path: string, e: React.MouseEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("Please sign in to access this feature")
      navigate("/auth")
      return
    }

    navigate(path)
  }

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-noise opacity-50 mix-blend-soft-light pointer-events-none"></div>
      <div className="absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-fashion-accent/10 blur-3xl"></div>
      <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-fashion-accent/5 blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left column — copy + CTAs */}
          <div className="max-w-xl text-left">
            <div className="mb-6 inline-flex items-center rounded-full border border-fashion-accent/20 bg-fashion-light px-4 py-1.5">
              {isPremium ? (
                <span className="flex items-center gap-1 text-xs font-medium">
                  <Gem className="h-3.5 w-3.5 text-purple-500" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                    Premium Access Unlocked
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-fashion-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your personal AI stylist
                </span>
              )}
            </div>

            <h1 className="fashion-heading animate-fade-up text-4xl sm:text-5xl md:text-6xl mb-6 leading-[1.05]">
              Your wardrobe,
              <span className="relative ml-2">
                <span className="relative z-10 text-fashion-accent">reimagined</span>
                <span className="absolute bottom-1.5 left-0 z-0 h-3 w-full bg-fashion-accent/20"></span>
              </span>
              <br />
              by AI
            </h1>

            <p className="fashion-subheading animate-fade-up [--delay:100ms] mt-6 max-w-lg text-base sm:text-lg">
              {isPremium
                ? "Unlimited, on-demand outfit ideas and premium style insights — built around your taste, body type and calendar."
                : "Tell us your taste and body type. Get outfit ideas, styling advice and shopping-ready looks in seconds — no stylist appointment required."}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4 animate-fade-up [--delay:200ms]">
              <ButtonCustom
                size="xl"
                className="group rounded-full w-full sm:w-auto"
                variant="accent"
                onClick={(e) => handleAuthCheck("/style-advice", e)}
              >
                <span>{isPremium ? "Get premium looks" : "Style me now"}</span>
                {user ? (
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                <span>Build my style profile</span>
              </ButtonCustom>
            </div>

            {/* Social-proof trust row (variant-B only) */}
            <div className="mt-8 flex items-center gap-3 animate-fade-up [--delay:300ms]">
              <div className="flex items-center gap-0.5 text-fashion-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Loved by style-savvy members worldwide
              </span>
            </div>
          </div>

          {/* Right column — stacked highlight cards */}
          <div className="relative hidden lg:block">
            <div className="animate-fade-up [--delay:150ms] rounded-2xl border border-fashion-dark/10 bg-fashion-light/60 p-6 shadow-sm backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2 text-fashion-accent">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold">Today's picks for you</span>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Smart-casual for the office", meta: "3 pieces · warm palette" },
                  { title: "Weekend brunch, effortless", meta: "4 pieces · soft neutrals" },
                  { title: "Evening out, statement look", meta: "3 pieces · bold accent" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-xl bg-background/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-fashion-text">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.meta}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-fashion-accent" />
                  </div>
                ))}
              </div>
            </div>

            {isPremium && (
              <div className="mt-4 animate-fade-up [--delay:300ms]">
                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-medium text-white">
                  <Gem className="h-3 w-3" />
                  <span>Premium Member Benefits Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
