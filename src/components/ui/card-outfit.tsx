import { cn } from "@/lib/utils"
import { Heart, ArrowUpRight } from "lucide-react"
import { useState } from "react"

interface OutfitCardProps {
  image: string
  title: string
  description: string
  className?: string
  tags?: string[]
  style?: React.CSSProperties
}

export function OutfitCard({ image, title, description, className, tags, style }: OutfitCardProps) {
  const [liked, setLiked] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-fashion-light",
        "ring-1 ring-fashion-dark/5 transition-all duration-500",
        "hover:shadow-lift hover:ring-fashion-accent/25",
        "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {/* Shimmer placeholder while the image loads */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-fashion-light via-fashion to-fashion-light" />
        )}
        <img
          src={image}
          alt={title}
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.06]",
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
          loading="lazy"
        />

        {/* Gradient scrim that deepens on hover for legible overlay text */}
        <div className="absolute inset-0 bg-gradient-to-t from-fashion-text/70 via-fashion-text/5 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

        {/* Like button */}
        <button
          onClick={() => setLiked(!liked)}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${title} from favorites` : `Save ${title} to favorites`}
          className="absolute right-3 top-3 rounded-full bg-white/70 p-2.5 shadow-soft backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-fashion-accent focus-visible:ring-offset-2"
        >
          <Heart
            aria-hidden="true"
            className={cn(
              "h-5 w-5 transition-all duration-300",
              liked ? "scale-110 fill-red-500 text-red-500" : "text-fashion-text/70"
            )}
          />
        </button>

        {/* Overlay caption revealed on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-medium text-fashion-text shadow-soft backdrop-blur-md transition-colors hover:bg-white">
            View outfit
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <h3 className="fashion-heading text-lg transition-colors duration-300 group-hover:text-fashion-accent">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-fashion-text/70">{description}</p>


        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="chip hover:border-fashion-accent/40 hover:bg-fashion-accent/10 hover:text-fashion-text"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
