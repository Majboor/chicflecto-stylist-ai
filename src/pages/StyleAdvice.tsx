
import { useState, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ButtonCustom } from "@/components/ui/button-custom";
import { UploadCloud, Camera, ChevronLeft, ChevronRight } from "lucide-react";
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
      const response = await fetch("https://fashion.techrealm.online/api/style", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
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
                  onClick={() => fileInputRef.current?.click()}
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
                  <ButtonCustom
                    type="button"
                    variant="subtle"
                    onClick={resetAnalysis}
                    className="rounded-full"
                    disabled={!selectedImage || loading}
                  >
                    Reset
                  </ButtonCustom>
                  <ButtonCustom
                    type="submit"
                    variant="accent"
                    className="rounded-full"
                    disabled={!selectedImage || loading}
                  >
                    {loading ? "Analyzing..." : "Get Style Advice"}
                  </ButtonCustom>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in">
              <FlashcardDeck styleResponse={styleResponse} />
              
              <div className="mt-12 text-center">
                <ButtonCustom
                  variant="outline"
                  className="rounded-full"
                  onClick={resetAnalysis}
                >
                  Analyze Another Outfit
                </ButtonCustom>
              </div>
            </div>
          )}
          
          <div className="mt-16 text-center">
            <ButtonCustom
              variant="subtle"
              className="rounded-full"
              onClick={() => navigate("/outfits")}
            >
              Browse Outfit Recommendations
            </ButtonCustom>
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
