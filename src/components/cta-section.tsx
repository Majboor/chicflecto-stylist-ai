
import { ButtonCustom } from "./ui/button-custom"
import { ArrowRight, LogIn } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export function CTASection() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);
  
  // Reset local loading state when auth loading changes
  useEffect(() => {
    if (!isLoading) {
      setLocalLoading(false);
    }
  }, [isLoading]);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (localLoading) {
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [localLoading]);
  
  const handleAuthCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Set local loading to ensure we don't get stuck
    setLocalLoading(true);
    
    if (isLoading) {
      toast.loading("Please wait while we check your account status");
      
      return;
    }
    
    if (!user) {
      toast.error("Please sign in to access this feature");
      navigate("/auth");
      return;
    }
    
    setLocalLoading(false);
    navigate("/style-advice");
  };
  
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-fashion-accent/5 to-fashion-accent/10 mix-blend-multiply"></div>
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fashion-accent/10 blur-3xl"></div>
      
      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="fashion-heading text-3xl sm:text-4xl mb-4">Ready to Transform Your Style?</h2>
          <p className="fashion-subheading mx-auto max-w-xl">
            Create your personalized style profile and get AI-powered fashion recommendations today
          </p>
          
          <div className="mt-10">
            <ButtonCustom 
              size="xl" 
              className="group rounded-full" 
              variant="accent"
              onClick={handleAuthCheck}
              disabled={localLoading || isLoading}
            >
              {localLoading || isLoading ? (
                <>
                  <span>Checking...</span>
                  <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                </>
              ) : (
                <>
                  <span>Get Started Now</span>
                  {user ? (
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  ) : (
                    <LogIn className="ml-2 h-4 w-4" />
                  )}
                </>
              )}
            </ButtonCustom>
          </div>
          
          <p className="mt-6 text-sm text-fashion-text/60">
            {user ? "Personalized style advice awaits." : "Sign in to unlock all features."}
          </p>
        </div>
      </div>
    </section>
  )
}
