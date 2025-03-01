
import { useState } from "react"
import { OutfitCard } from "./ui/card-outfit"
import { ButtonCustom } from "./ui/button-custom"

const CATEGORIES = ["All", "Casual", "Formal", "Business", "Athletic", "Evening"]

const OUTFITS = [
  {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    title: "Modern Business Casual",
    description: "Elegant office style with comfortable elements",
    tags: ["Business", "Minimalist", "Spring"],
    category: "Business"
  },
  {
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    title: "Weekend Smart Casual",
    description: "Relaxed yet refined weekend outfit",
    tags: ["Casual", "Weekend", "Fall"],
    category: "Casual"
  },
  {
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    title: "Evening Sophistication",
    description: "Elegant outfit for special occasions",
    tags: ["Evening", "Elegant", "Summer"],
    category: "Evening"
  },
  {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    title: "Minimalist Formal",
    description: "Clean lines and sophisticated formal style",
    tags: ["Formal", "Minimalist", "Winter"],
    category: "Formal"
  },
  {
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    title: "Active Lifestyle",
    description: "Performance meets style for your workouts",
    tags: ["Athletic", "Comfortable", "All Seasons"],
    category: "Athletic"
  },
  {
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
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
        <div className="mx-auto max-w-2xl text-center">
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
        
        <div className="mx-auto mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOutfits.map((outfit, index) => (
            <OutfitCard
              key={index}
              image={outfit.image}
              title={outfit.title}
              description={outfit.description}
              tags={outfit.tags}
              className="animate-scale-in"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <ButtonCustom variant="outline" className="rounded-full">
            View All Outfit Recommendations
          </ButtonCustom>
        </div>
      </div>
    </section>
  )
}
