
import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { OutfitCard } from "./ui/card-outfit"
import { ButtonCustom } from "./ui/button-custom"

const CATEGORIES = ["All", "Casual", "Formal", "Business", "Athletic", "Evening"]

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`

const OUTFITS = [
  {
    image: img("1539109136881-3be0616acf4b"),
    title: "Modern Business Casual",
    description: "Elegant office style with comfortable elements",
    tags: ["Business", "Minimalist", "Spring"],
    category: "Business"
  },
  {
    image: img("1483985988355-763728e1935b"),
    title: "Weekend Smart Casual",
    description: "Relaxed yet refined weekend outfit",
    tags: ["Casual", "Weekend", "Fall"],
    category: "Casual"
  },
  {
    image: img("1490481651871-ab68de25d43d"),
    title: "Evening Sophistication",
    description: "Elegant outfit for special occasions",
    tags: ["Evening", "Elegant", "Summer"],
    category: "Evening"
  },
  {
    image: img("1487412720507-e7ab37603c6f"),
    title: "Minimalist Formal",
    description: "Clean lines and sophisticated formal style",
    tags: ["Formal", "Minimalist", "Winter"],
    category: "Formal"
  },
  {
    image: img("1515372039744-b8f02a3ae446"),
    title: "Active Lifestyle",
    description: "Performance meets style for your workouts",
    tags: ["Athletic", "Comfortable", "All Seasons"],
    category: "Athletic"
  },
  {
    image: img("1524504388940-b1c1722653e1"),
    title: "Smart Business",
    description: "Professional attire for the modern workplace",
    tags: ["Business", "Professional", "Fall"],
    category: "Business"
  },
]

export function OutfitShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  const filteredOutfits = selectedCategory === "All" 
    ? OUTFITS 
    : OUTFITS.filter(outfit => outfit.category === selectedCategory)
  
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="eyebrow mb-4">The lookbook</span>
          <h2 className="fashion-heading text-3xl sm:text-4xl mb-4">Curated Outfit Inspirations</h2>
          <p className="fashion-subheading">
            Explore style collections tailored to different occasions
          </p>
        </div>
        
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((category) => (
            <ButtonCustom
              key={category}
              variant={selectedCategory === category ? "accent" : "subtle"}
              className="rounded-full text-sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </ButtonCustom>
          ))}
        </div>
        
        {filteredOutfits.length > 0 ? (
          <div className="mx-auto mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOutfits.map((outfit, index) => (
              <OutfitCard
                key={index}
                image={outfit.image}
                title={outfit.title}
                description={outfit.description}
                tags={outfit.tags}
                className="animate-scale-in [animation-fill-mode:both]"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-dashed border-fashion-dark/15 bg-fashion-light/40 py-16 text-center">
            <p className="fashion-heading text-lg text-fashion-text/80">Nothing here yet</p>
            <p className="mt-2 text-sm text-fashion-text/60">
              No looks in {selectedCategory} for now — try another style.
            </p>
          </div>
        )}

        <div className="mt-16 text-center">
          <ButtonCustom variant="outline" className="group rounded-full">
            View All Outfit Recommendations
            <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </ButtonCustom>
        </div>
      </div>
    </section>
  )
}
