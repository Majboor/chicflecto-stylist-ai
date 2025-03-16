import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UploadCloud, X, Check, CreditCard, LogIn } from "lucide-react";
import { toast } from "sonner";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

const buttonVariants = ({ 
  variant = "default", 
  size = "default", 
  className = "" 
}: { 
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "subtle" | "accent" | "glass"; 
  size?: "default" | "sm" | "lg" | "xl" | "icon"; 
  className?: string;
}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantStyles: Record<string, string> = {
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
  
  const sizeStyles: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    xl: "h-12 rounded-md px-10 text-base",
    icon: "h-10 w-10",
  };
  
  return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
};

const StyleAdvice = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [styleResponse, setStyleResponse] = useState<StyleResponse | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, subscriptionStatus, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (window.location.hash === "#pricing" && pricingRef.current) {
      setTimeout(() => {
        pricingRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result === "string") {
          setPreviewUrl(fileReader.result);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  const initiatePayment = async () => {
    if (!user) {
      toast.error("Please log in to subscribe");
      navigate("/auth");
      return;
    }

    setIsPaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("payment-handler", {
        body: {
          amount: 5141,
          redirection_url: window.location.origin + "/payment-callback"
        }
      });
      
      if (error) {
        throw new Error(error.message || "Payment initialization failed");
      }
      
      console.log("Payment data:", data);
      
      if (data.payment_url) {
        window.open(data.payment_url, "_blank");
        toast.success("Payment page opened in a new tab");
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    if (!user) {
      toast.error("Please log in to use this feature");
      navigate("/auth");
      return;
    }

    if (subscriptionStatus === "expired") {
      setShowSubscriptionModal(true);
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("image", selectedImage);
    
    try {
      console.log("Sending request to API with image:", selectedImage.name);
      
      const response = await fetch("https://fashion.techrealm.online/api/style", {
        method: "POST",
        body: formData,
      });
      
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
      
      if (subscriptionStatus === "free_trial") {
        const { error } = await supabase
          .from("subscriptions")
          .update({ 
            free_trial_used: true 
          })
          .eq("user_id", user.id)
          .eq("status", "free_trial");
          
        if (error) {
          console.error("Error updating subscription:", error);
        }
      }
      
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

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const pricingTiers: PricingTier[] = [
    {
      name: "Free",
      price: "$0",
      description: "Try once and see what our AI can do for you",
      features: [
        "One-time style analysis",
        "Basic outfit recommendations",
        "Limited access to AI features"
      ],
      buttonText: "Current Plan"
    },
    {
      name: "Starter",
      price: "$14",
      description: "Unlock unlimited style advice",
      features: [
        "Unlimited outfit analyses",
        "Personalized style recommendations",
        "Priority processing",
        "Access to all AI features"
      ],
      buttonText: "Get Started",
      popular: true
    },
    {
      name: "Pro",
      price: "$29",
      description: "For fashion enthusiasts and professionals",
      features: [
        "Everything in Starter",
        "Professional styling consultation",
        "Seasonal trend updates",
        "Personal wardrobe management"
      ],
      buttonText: "Coming Soon"
    }
  ];

  const renderAuthButton = () => {
    if (authLoading) {
      return (
        <button
          className={cn(buttonVariants({ variant: "subtle", className: "rounded-full" }))}
          disabled
        >
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
          Loading...
        </button>
      );
    }
    
    if (!user) {
      return (
        <button
          className={cn(buttonVariants({ variant: "accent", className: "rounded-full" }))}
          onClick={() => navigate("/auth")}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </button>
      );
    }
    
    return null;
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
            {renderAuthButton()}
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
                    disabled={!selectedImage || loading || authLoading}
                  >
                    {loading ? "Analyzing..." : "Get Style Advice"}
                  </button>
                </div>
                
                {subscriptionStatus === "expired" && (
                  <div className="mt-4 p-4 bg-fashion-accent/10 rounded-lg text-center">
                    <p className="text-sm font-medium text-fashion-accent">
                      You've used your free analysis. Subscribe to our Starter package for unlimited style advice.
                    </p>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "accent", className: "mt-2 rounded-full text-xs py-1 px-3" }))}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSubscriptionModal(true);
                      }}
                    >
                      Upgrade Now
                    </button>
                  </div>
                )}
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

          <div ref={pricingRef} id="pricing" className="mt-24 mb-12">
            <div className="text-center mb-12">
              <h2 className="fashion-heading text-3xl md:text-4xl mb-4">Choose Your Style Plan</h2>
              <p className="fashion-subheading max-w-2xl mx-auto">
                Unlock unlimited style advice and transform your fashion experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingTiers.map((tier, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "rounded-xl p-8 transition-all hover:shadow-xl",
                    tier.popular 
                      ? "bg-fashion-accent/10 border-2 border-fashion-accent relative" 
                      : "bg-white border border-gray-200"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-fashion-accent text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.name !== "Free" && <span className="text-gray-500">/month</span>}
                  </div>
                  <p className="text-gray-600 mb-6">{tier.description}</p>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-fashion-accent mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (tier.name === "Starter") {
                        initiatePayment();
                      }
                    }}
                    disabled={tier.name === "Pro" || tier.name === "Free" || isPaymentLoading}
                    className={cn(
                      buttonVariants({ 
                        variant: tier.popular ? "accent" : "outline", 
                        className: "w-full rounded-full mt-auto" 
                      }),
                      tier.name === "Pro" && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isPaymentLoading && tier.name === "Starter" ? "Processing..." : tier.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Your Style Experience</DialogTitle>
            <DialogDescription>
              You've used your free style analysis. Upgrade to our Starter package for unlimited style advice.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-fashion-light/20 my-4">
            <h3 className="font-semibold text-lg mb-2">Starter Package - $14/month</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-fashion-accent mr-2 shrink-0 mt-0.5" />
                <span>Unlimited outfit analyses</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-fashion-accent mr-2 shrink-0 mt-0.5" />
                <span>Personalized style recommendations</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-fashion-accent mr-2 shrink-0 mt-0.5" />
                <span>Priority processing</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-fashion-accent mr-2 shrink-0 mt-0.5" />
                <span>Access to all AI features</span>
              </li>
            </ul>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <button
              type="button"
              className={buttonVariants({ variant: "subtle" })}
              onClick={() => setShowSubscriptionModal(false)}
            >
              Later
            </button>
            <button
              type="button"
              className={buttonVariants({ variant: "accent" })}
              onClick={initiatePayment}
              disabled={isPaymentLoading}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isPaymentLoading ? "Processing..." : "Subscribe Now"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default StyleAdvice;
