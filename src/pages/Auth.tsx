
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { clearSubscriptionCache } from "@/services/subscriptionService";

const AuthPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated and redirect if needed
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setSession(null);
          setAuthError("Failed to check authentication status.");
          setIsLoading(false);
          return;
        }
        
        setSession(data.session);
        
        if (data.session) {
          // Clear any stale trial usage data
          localStorage.removeItem("fashion_app_free_trial_used");
          
          // For truly new users coming in, make sure we mark them as first-time
          localStorage.setItem("fashion_app_first_login", "true");
          
          // Clear subscription cache to ensure fresh data
          clearSubscriptionCache(data.session.user.id);
          
          toast.success("You're signed in!");
          
          // Use a shorter timeout for better UX
          const timer = setTimeout(() => {
            navigate("/");
          }, 500);
          
          setRedirectTimer(timer as unknown as number);
          return () => clearTimeout(timer);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // For brand new users, set proper localStorage state
          if (event === 'SIGNED_IN') {
            console.log("Setting up first-time user state");
            localStorage.setItem("fashion_app_first_login", "true");
            localStorage.removeItem("fashion_app_free_trial_used");
            // Clear subscription cache to ensure fresh data
            clearSubscriptionCache(session.user.id);
          }
          
          toast.success("Successfully signed in!");
          
          // Set a shorter redirect timeout
          const timer = setTimeout(() => {
            navigate("/");
          }, 500);
          
          setRedirectTimer(timer as unknown as number);
          return () => clearTimeout(timer);
        }
      }
    );

    // Shorter timeout for faster UX
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      if (subscription) subscription.unsubscribe();
      if (redirectTimer) clearTimeout(redirectTimer);
      clearTimeout(timeoutId);
    };
  }, [navigate, redirectTimer]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-md">
          <div className="mb-10 text-center">
            <h1 className="fashion-heading text-3xl md:text-4xl mb-4">Welcome to StylistAI</h1>
            <p className="fashion-subheading">
              Sign in or create an account to get personalized style advice
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-xl">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-32">
                <div className="animate-spin h-8 w-8 border-4 border-fashion-accent border-t-transparent rounded-full"></div>
                <p className="text-fashion-text/70 mt-2">
                  Loading...
                </p>
              </div>
            ) : (
              <>
                {authError && (
                  <div className="mb-4 p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">
                    {authError}
                  </div>
                )}
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: "#F43F5E",
                          brandAccent: "#E11D48",
                        }
                      },
                    },
                    style: {
                      button: {
                        borderRadius: '0.5rem',
                      },
                      input: {
                        borderRadius: '0.5rem',
                      }
                    }
                  }}
                  providers={[]}
                  redirectTo={window.location.origin}
                  onError={(error) => {
                    console.error("Auth error:", error);
                    setAuthError(error.message);
                    toast.error("Authentication error: " + error.message);
                  }}
                />
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthPage;
