
import { useState, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { useNavigate } from "react-router-dom";

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
  };
}

const StyleAdvice = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [styleResponse, setStyleResponse] = useState<StyleResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result === "string") {
          setPreviewUrl(fileReader.result);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("image", selectedImage);
    
    try {
      // Add console logs for debugging
      console.log("Sending request to API with image:", selectedImage.name);
      
      const response = await fetch("https://fashion.techrealm.online/api/style", {
        method: "POST",
        body: formData,
      });
      
      // Log the response status
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(`Server responded with ${response.status}: ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log("API response data:", data);
      
      if (!data.style_advice || !data.outfit_analysis) {
        throw new Error("Invalid response format from server");
      }
      
      setStyleResponse(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing style:", error);
      toast.error("Failed to analyze style. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setStyleResponse(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageAreaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-10 text-center">
            <h1 className="fashion-heading text-3xl md:text-4xl mb-4">AI Style Assistant</h1>
            <p className="fashion-subheading max-w-2xl mx-auto">
              Upload a photo of your outfit and get personalized style advice from our AI stylist
            </p>
          </div>
          
          {!styleResponse ? (
            <div className="max-w-xl mx-auto glass-card p-8 rounded-xl animate-scale-in">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-fashion-light/20 transition-colors",
                    previewUrl ? "border-fashion-accent" : "border-fashion-text/30"
                  )}
                  onClick={handleImageAreaClick}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={previewUrl} 
                        alt="Selected outfit" 
                        className="max-h-[300px] mx-auto rounded-md object-contain"
                      />
                      <p className="text-sm text-fashion-text/70">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <UploadCloud className="h-12 w-12 mx-auto text-fashion-text/50" />
                      <p className="font-medium">Upload an outfit photo</p>
                      <p className="text-sm text-fashion-text/70">
                        Drag and drop or click to browse<br />
                        Supported formats: JPEG, PNG
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png"
                    className="hidden"
                  />
                </div>
                
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    className={cn(buttonVariants({ variant: "subtle", className: "rounded-full" }))}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      resetAnalysis();
                    }}
                    disabled={!selectedImage || loading}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className={cn(buttonVariants({ variant: "accent", className: "rounded-full" }))}
                    onClick={(e) => {
                      if (!selectedImage || loading) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    disabled={!selectedImage || loading}
                  >
                    {loading ? "Analyzing..." : "Get Style Advice"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in">
              <FlashcardDeck styleResponse={styleResponse} />
              
              <div className="mt-12 text-center">
                <button
                  className={cn(buttonVariants({ variant: "outline", className: "rounded-full" }))}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    resetAnalysis();
                  }}
                >
                  Analyze Another Outfit
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-16 text-center">
            <button
              className={cn(buttonVariants({ variant: "subtle", className: "rounded-full" }))}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate("/outfits");
              }}
            >
              Browse Outfit Recommendations
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StyleAdvice;

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Import buttonVariants from ButtonCustom to use directly
const buttonVariants = ({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "subtle" | "accent" | "glass";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  className?: string;
}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantStyles = {
    default: "bg-fashion-text text-primary-foreground hover:bg-fashion-text/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-fashion-dark/20 bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-fashion-light text-fashion-text hover:bg-fashion-light/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-fashion-accent underline-offset-4 hover:underline",
    subtle: "bg-fashion-light/50 text-fashion-text hover:bg-fashion-light",
    accent: "bg-fashion-accent text-white hover:bg-fashion-accent/90",
    glass: "backdrop-blur-md bg-white/20 border border-white/30 text-fashion-text hover:bg-white/30 shadow-sm",
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    xl: "h-12 rounded-md px-10 text-base",
    icon: "h-10 w-10",
  };
  
  return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
};
