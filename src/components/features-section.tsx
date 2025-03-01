
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
          <h2 className="fashion-heading text-3xl sm:text-4xl mb-4">Smart Fashion Features</h2>
          <p className="fashion-subheading">
            Discover how our AI helps you look your best
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card card-hover p-6"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fashion-accent/10">
                <feature.icon className="h-6 w-6 text-fashion-accent" />
              </div>
              <h3 className="fashion-heading mb-2 text-xl">{feature.title}</h3>
              <p className="text-fashion-text/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
