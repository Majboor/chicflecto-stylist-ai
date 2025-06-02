import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonCustom } from "./ui/button-custom";
import { cn } from "@/lib/utils";

interface StyleResponse {
  outfit_analysis: {
    items: string[];
  };
  style_advice: {
    cards: {
      card: number;
      content: string;
      suggestion_image?: string;
    }[];
    suggestion_image?: string;
  };
}

interface FlashcardDeckProps {
  styleResponse: StyleResponse;
  originalImageUrl: string | null;
}

// Define a proper type for extended cards
type ExtendedCard = {
  card: number;
  content: string;
  suggestion_image?: string;
  isOriginalImage?: boolean;
  isSuggestionImage?: boolean;
};

export function FlashcardDeck({ styleResponse, originalImageUrl }: FlashcardDeckProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [animating, setAnimating] = useState(false);
  const cards = styleResponse.style_advice.cards;
  const outfitItems = styleResponse.outfit_analysis.items;
  const suggestionImage = styleResponse.style_advice.suggestion_image;
  
  // Create extended cards array with original image at start and suggestion image at end
  const extendedCards: ExtendedCard[] = [
    // Original image card (always first)
    { card: 0, content: "Your Original Outfit", isOriginalImage: true },
    // Existing cards (shifted by 1)
    ...cards.map(card => ({ ...card, isOriginalImage: false, isSuggestionImage: false })),
    // Suggestion image card (always last, if available)
    ...(suggestionImage ? [{ card: cards.length + 1, content: "AI Styling Suggestion", isSuggestionImage: true }] : [])
  ];
  
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  
  const goToNextCard = () => {
    if (currentCard < extendedCards.length - 1 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentCard(prev => prev + 1);
        setAnimating(false);
      }, 300);
    }
  };
  
  const goToPrevCard = () => {
    if (currentCard > 0 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentCard(prev => prev - 1);
        setAnimating(false);
      }, 300);
    }
  };
  
  // Setup touch event handlers for swiping
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;
      
      // Swipe threshold (50px)
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left - go to next card
          goToNextCard();
        } else {
          // Swipe right - go to previous card
          goToPrevCard();
        }
      }
      
      touchStartX.current = null;
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentCard, extendedCards.length]);
  
  return (
    <div className="max-w-3xl mx-auto">
      <div 
        ref={cardRef}
        className="relative h-[500px] sm:h-[600px] w-full perspective"
      >
        {extendedCards.map((card, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 backface-hidden rounded-2xl glass-card border border-white/20 shadow-elegant p-6 sm:p-8 flex flex-col",
              "transition-all duration-300 ease-in-out transform",
              index === currentCard && "z-10 scale-100 rotate-0 opacity-100",
              index < currentCard && "scale-95 -rotate-6 opacity-0 -translate-x-[120%]",
              index > currentCard && "scale-95 rotate-6 opacity-0 translate-x-[120%]",
              animating && "pointer-events-none"
            )}
          >
            <div className="text-center mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-fashion-accent/10 text-fashion-accent text-sm">
                {index + 1} / {extendedCards.length}
              </div>
            </div>
            
            {/* Original Image Card */}
            {card.isOriginalImage && (
              <>
                <h3 className="fashion-heading text-xl sm:text-2xl mb-4 text-center">
                  Your Original Outfit
                </h3>
                <div className="flex-grow flex items-center justify-center">
                  {originalImageUrl ? (
                    <img 
                      src={originalImageUrl} 
                      alt="Your original outfit" 
                      className="max-h-[400px] max-w-full object-contain rounded-lg shadow-soft"
                    />
                  ) : (
                    <div className="text-center text-fashion-text/60">
                      <p>Original image not available</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Suggestion Image Card */}
            {card.isSuggestionImage && (
              <>
                <h3 className="fashion-heading text-xl sm:text-2xl mb-4 text-center">
                  AI Styling Suggestion
                </h3>
                <div className="flex-grow flex items-center justify-center">
                  {suggestionImage ? (
                    <img 
                      src={suggestionImage} 
                      alt="AI styling suggestion" 
                      className="max-h-[400px] max-w-full object-contain rounded-lg shadow-soft"
                    />
                  ) : (
                    <div className="text-center text-fashion-text/60">
                      <p>Styling suggestion image not available</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Original Cards Content */}
            {!card.isOriginalImage && !card.isSuggestionImage && (
              <>
                {/* First card (Analysis Overview) - adjusted index since we added original image */}
                {index === 1 && (
                  <>
                    <h3 className="fashion-heading text-xl sm:text-2xl mb-4 text-center">
                      {card.content}
                    </h3>
                    <div className="flex-grow flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-medium mb-2">We've identified these items:</div>
                        <ul className="space-y-1">
                          {outfitItems.map((item, i) => (
                            <li key={i} className="text-fashion-text/80">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Second card (Current Outfit) - adjusted index */}
                {index === 2 && (
                  <>
                    <h3 className="fashion-heading text-xl sm:text-2xl mb-4 text-center">
                      Your Current Outfit
                    </h3>
                    <div className="flex-grow flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-fashion-text/80 text-lg">{card.content}</p>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Remaining cards (Style advice) - adjusted index */}
                {index >= 3 && !card.isSuggestionImage && (
                  <>
                    <div className="flex-grow flex flex-col">
                      {card.suggestion_image ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                          <div className="flex flex-col justify-center">
                            <p className="text-fashion-text/90 mb-4">{card.content}</p>
                          </div>
                          <div className="flex items-center justify-center">
                            <img 
                              src={card.suggestion_image} 
                              alt="Style suggestion" 
                              className="max-h-[300px] object-contain rounded-lg shadow-soft"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-fashion-text/90 text-lg max-w-lg text-center">
                            {card.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center items-center space-x-4 mt-6">
        <ButtonCustom
          variant="subtle"
          className="rounded-full h-10 w-10 p-0"
          onClick={goToPrevCard}
          disabled={currentCard === 0 || animating}
        >
          <ChevronLeft className="h-5 w-5" />
        </ButtonCustom>
        
        <div className="flex space-x-1">
          {extendedCards.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentCard ? "bg-fashion-accent w-4" : "bg-fashion-text/20 w-2",
                "hover:bg-fashion-accent/70"
              )}
              onClick={() => setCurrentCard(index)}
              disabled={animating}
            />
          ))}
        </div>
        
        <ButtonCustom
          variant="subtle"
          className="rounded-full h-10 w-10 p-0"
          onClick={goToNextCard}
          disabled={currentCard === extendedCards.length - 1 || animating}
        >
          <ChevronRight className="h-5 w-5" />
        </ButtonCustom>
      </div>
    </div>
  );
}
