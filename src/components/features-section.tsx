
import { 
  Sparkles, 
  Shirt, 
  PanelTop, 
  Calendar, 
  ShoppingBag, 
  Palette 
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Style Analysis",
    description: "Our AI analyzes your preferences, body type, and style goals to create perfect outfit recommendations."
  },
  {
    icon: Shirt,
    title: "Personalized Outfits",
    description: "Get outfit suggestions tailored specifically to your unique style, occasion, and seasonal needs."
  },
  {
    icon: Palette,
    title: "Color Coordination",
    description: "Discover color palettes that complement your skin tone and create visually appealing combinations."
  },
  {
    icon: PanelTop,
    title: "Wardrobe Organization",
    description: "Organize your clothing items into cohesive collections and maximize outfit possibilities."
  },
  {
    icon: Calendar,
    title: "Seasonal Recommendations",
    description: "Stay on-trend with curated seasonal style updates and fresh outfit ideas."
  },
  {
    icon: ShoppingBag,
    title: "Shopping Assistance",
    description: "Receive personalized shopping recommendations to fill gaps in your wardrobe."
  }
]

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-fashion-light/50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mb-4">What you get</span>
          <h2 className="fashion-heading text-3xl sm:text-4xl mb-4">Smart Fashion Features</h2>
          <p className="fashion-subheading">
            Discover how our AI helps you look your best
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative animate-fade-up rounded-2xl border border-fashion-dark/5 bg-white/60 p-6 backdrop-blur-md transition-all duration-500 [animation-fill-mode:both] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-fashion-accent/25 hover:bg-white/85 hover:shadow-lift"
              style={{
                animationDelay: `${index * 90}ms`,
              }}
            >
              {/* Soft accent glow that fades in on hover */}
              <div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-fashion-accent/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fashion-accent/15 to-fashion-gold/15 ring-1 ring-fashion-accent/10 transition-all duration-500 group-hover:scale-110 group-hover:ring-fashion-accent/30">
                <feature.icon className="h-6 w-6 text-fashion-accent transition-transform duration-500 group-hover:-rotate-6" />
              </div>
              <h3 className="fashion-heading mb-2 text-xl transition-colors duration-300 group-hover:text-fashion-accent">{feature.title}</h3>
              <p className="leading-relaxed text-fashion-text/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
