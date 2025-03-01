
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ButtonCustom } from "@/components/ui/button-custom"
import { useState } from "react"
import { Heart, Share2, Bookmark } from "lucide-react"

// Sample inspirations data
const INSPIRATIONS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    title: "Minimalist Spring Layers",
    description: "Create depth with neutral tones and thoughtful layering",
    tags: ["Minimalist", "Spring", "Layering"],
    likes: 245
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    title: "Modern Business Casual",
    description: "Effortless sophistication for the contemporary workplace",
    tags: ["Business", "Professional", "Modern"],
    likes: 189
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    title: "Weekend City Exploration",
    description: "Comfortable yet stylish pieces for urban adventures",
    tags: ["Casual", "Urban", "Weekend"],
    likes: 327
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    title: "Evening Elegance",
    description: "Sophisticated outfits for dinner and formal events",
    tags: ["Evening", "Formal", "Elegant"],
    likes: 412
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    title: "Sustainable Style",
    description: "Eco-friendly fashion that doesn't compromise on aesthetics",
    tags: ["Sustainable", "Conscious", "Timeless"],
    likes: 265
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    title: "Monochrome Magic",
    description: "Creating impact with single-color palettes",
    tags: ["Monochrome", "Minimalist", "Modern"],
    likes: 198
  },
];

const CATEGORIES = ["All", "Minimalist", "Business", "Casual", "Evening", "Sustainable", "Monochrome"]

const InspirationCard = ({ inspiration }: { inspiration: typeof INSPIRATIONS[0] }) => {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  
  return (
    <div className="glass-card overflow-hidden rounded-xl transition-all hover:shadow-elegant">
      <div className="aspect-[4/5] w-full overflow-hidden relative group">
        <img
          src={inspiration.image}
          alt={inspiration.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="text-white font-medium text-lg">{inspiration.title}</h3>
          <p className="text-white/80 text-sm mt-1">{inspiration.description}</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {inspiration.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-full bg-fashion/30 px-2.5 py-0.5 text-xs text-fashion-text/80">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <button 
            onClick={() => setLiked(!liked)} 
            className="flex items-center gap-1 text-sm text-fashion-text/70 hover:text-fashion-accent transition-colors"
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-fashion-accent text-fashion-accent' : ''}`} />
            <span>{liked ? inspiration.likes + 1 : inspiration.likes}</span>
          </button>
          
          <div className="flex gap-3">
            <button className="text-fashion-text/70 hover:text-fashion-accent transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setSaved(!saved)} 
              className={`transition-colors ${saved ? 'text-fashion-accent' : 'text-fashion-text/70 hover:text-fashion-accent'}`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-fashion-accent' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Inspirations = () => {
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  const filteredInspirations = selectedCategory === "All" 
    ? INSPIRATIONS 
    : INSPIRATIONS.filter(item => item.tags.includes(selectedCategory))
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-10 text-center">
            <h1 className="fashion-heading text-3xl md:text-4xl mb-4">Style Inspirations</h1>
            <p className="fashion-subheading max-w-2xl mx-auto">
              Discover creative style ideas and fashion inspirations from around the world
            </p>
          </div>
          
          {/* Category filter */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
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
          
          {/* Masonry-like grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInspirations.map((inspiration) => (
              <InspirationCard 
                key={inspiration.id}
                inspiration={inspiration}
              />
            ))}
          </div>
          
          {filteredInspirations.length === 0 && (
            <div className="text-center py-12">
              <h3 className="fashion-heading text-xl mb-2">No inspirations found</h3>
              <p className="text-fashion-text/70 mb-6">Try selecting a different category</p>
              <ButtonCustom 
                variant="outline" 
                className="rounded-full"
                onClick={() => setSelectedCategory("All")}
              >
                View All Inspirations
              </ButtonCustom>
            </div>
          )}
          
          {filteredInspirations.length > 0 && (
            <div className="mt-12 flex justify-center">
              <ButtonCustom variant="outline" className="rounded-full">
                Load More Inspirations
              </ButtonCustom>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default Inspirations
