
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OutfitCard } from "@/components/ui/card-outfit"
import { ButtonCustom } from "@/components/ui/button-custom"
import { Filter, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

// Sample outfit data
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
  {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    title: "Casual Friday",
    description: "Professional yet relaxed end-of-week style",
    tags: ["Business", "Casual", "All Seasons"],
    category: "Business"
  },
  {
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    title: "Weekend Getaway",
    description: "Comfortable and stylish travel outfit",
    tags: ["Casual", "Travel", "Summer"],
    category: "Casual"
  },
  {
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    title: "Cocktail Attire",
    description: "Semi-formal outfit for evening events",
    tags: ["Evening", "Formal", "Winter"],
    category: "Evening"
  },
];

const CATEGORIES = ["All", "Casual", "Formal", "Business", "Athletic", "Evening"]
const SEASONS = ["All Seasons", "Spring", "Summer", "Fall", "Winter"]
const STYLES = ["All Styles", "Minimalist", "Classic", "Modern", "Vintage", "Bohemian"]

const Outfits = () => {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSeason, setSelectedSeason] = useState("All Seasons")
  const [selectedStyle, setSelectedStyle] = useState("All Styles")
  const [showFilters, setShowFilters] = useState(false)
  
  const filteredOutfits = OUTFITS
    .filter(outfit => selectedCategory === "All" || outfit.category === selectedCategory)
    .filter(outfit => selectedSeason === "All Seasons" || outfit.tags.includes(selectedSeason))
    .filter(outfit => selectedStyle === "All Styles" || outfit.tags.includes(selectedStyle))
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-10 text-center">
            <h1 className="fashion-heading text-3xl md:text-4xl mb-4">Outfit Recommendations</h1>
            <p className="fashion-subheading max-w-2xl mx-auto">
              Discover curated outfit combinations tailored to your style preferences and body type
            </p>
          </div>
          
          {/* Filters */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <ButtonCustom 
                variant="subtle" 
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-full flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </ButtonCustom>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-fashion-text/70">Sort by:</span>
                <select className="px-3 py-1 rounded-md border border-fashion-dark/20 text-sm focus:outline-none focus:ring-2 focus:ring-fashion-accent/50">
                  <option>Recommended</option>
                  <option>Newest</option>
                  <option>Popular</option>
                </select>
              </div>
            </div>
            
            {showFilters && (
              <div className="glass-card p-4 mb-6 animate-slide-down-fade">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(category => (
                        <ButtonCustom
                          key={category}
                          variant={selectedCategory === category ? "accent" : "subtle"}
                          className="rounded-full text-xs px-3 py-1 h-auto"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </ButtonCustom>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Season</label>
                    <div className="flex flex-wrap gap-2">
                      {SEASONS.map(season => (
                        <ButtonCustom
                          key={season}
                          variant={selectedSeason === season ? "accent" : "subtle"}
                          className="rounded-full text-xs px-3 py-1 h-auto"
                          onClick={() => setSelectedSeason(season)}
                        >
                          {season}
                        </ButtonCustom>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Style</label>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map(style => (
                        <ButtonCustom
                          key={style}
                          variant={selectedStyle === style ? "accent" : "subtle"}
                          className="rounded-full text-xs px-3 py-1 h-auto"
                          onClick={() => setSelectedStyle(style)}
                        >
                          {style}
                        </ButtonCustom>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Outfit grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOutfits.map((outfit, index) => (
              <OutfitCard
                key={index}
                image={outfit.image}
                title={outfit.title}
                description={outfit.description}
                tags={outfit.tags}
                className="animate-scale-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              />
            ))}
          </div>
          
          {filteredOutfits.length === 0 && (
            <div className="text-center py-12">
              <h3 className="fashion-heading text-xl mb-2">No matching outfits found</h3>
              <p className="text-fashion-text/70 mb-6">Try adjusting your filters to see more options</p>
              <ButtonCustom 
                variant="outline" 
                className="rounded-full"
                onClick={() => {
                  setSelectedCategory("All")
                  setSelectedSeason("All Seasons")
                  setSelectedStyle("All Styles")
                }}
              >
                Reset Filters
              </ButtonCustom>
            </div>
          )}
          
          {filteredOutfits.length > 0 && (
            <div className="mt-12 flex justify-center">
              <ButtonCustom variant="outline" className="rounded-full">
                Load More
              </ButtonCustom>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default Outfits
