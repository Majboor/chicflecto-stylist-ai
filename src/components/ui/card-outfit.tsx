
import { cn } from "@/lib/utils"
import { Heart } from "lucide-react"
import { useState } from "react"

interface OutfitCardProps {
  image: string
  title: string
  description: string
  className?: string
  tags?: string[]
}

export function OutfitCard({ image, title, description, className, tags }: OutfitCardProps) {
  const [liked, setLiked] = useState(false)
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl bg-fashion-light",
      "transition-all duration-300 hover:shadow-elegant",
      className
    )}>
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <button 
        onClick={() => setLiked(!liked)} 
        className="absolute right-3 top-3 rounded-full p-2 glass-effect shadow-soft transition-all hover:scale-110 active:scale-95"
      >
        <Heart 
          className={cn(
            "h-5 w-5 transition-colors", 
            liked ? "fill-red-500 text-red-500" : "text-fashion-text/70"
          )} 
        />
      </button>
      
      <div className="p-4">
        <h3 className="fashion-heading text-lg">{title}</h3>
        <p className="mt-1 text-sm text-fashion-text/70">{description}</p>
        
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full bg-fashion/50 px-2.5 py-0.5 text-xs text-fashion-text/80">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
