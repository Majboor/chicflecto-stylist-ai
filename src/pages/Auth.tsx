
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
  const [isLoading, setIsLoading] = useState(false); // Start with false to avoid unnecessary loading state
  const [authError, setAuthError] = useState<string | null>(null);

  // Immediately check if the user is already signed in
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Auth page: Checking initial session");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setSession(null);
          setAuthError("Failed to check authentication status.");
          return;
        }
        
        setSession(data.session);
        
        if (data.session) {
          console.log("Auth page: User already signed in, redirecting");
          // Clear any stale trial usage data
          localStorage.removeItem("fashion_app_free_trial_used");
          
          // For truly new users coming in, make sure we mark them as first-time
          localStorage.setItem("fashion_app_first_login", "true");
          
          // Clear subscription cache to ensure fresh data
          clearSubscriptionCache(data.session.user.id);
          
          toast.success("You're signed in!");
          
          // Immediately navigate without delay
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("An unexpected error occurred. Please try again.");
      }
    };
    
    // Run immediately
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
          
          // Navigate immediately without delay
          navigate("/");
        }
      }
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-12 pb-16"> {/* Reduced padding to prevent scrolling */}
        <div className="container mx-auto px-6 max-w-md">
          <div className="mb-6"> {/* Reduced margin to prevent scrolling */}
            <h1 className="fashion-heading text-3xl mb-2">Welcome to StylistAI</h1> {/* Reduced size and margin */}
            <p className="fashion-subheading">
              Sign in or create an account to get personalized style advice
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl"> {/* Reduced padding */}
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-24"> {/* Reduced height */}
                <div className="animate-spin h-6 w-6 border-4 border-fashion-accent border-t-transparent rounded-full"></div>
                <p className="text-fashion-text/70 mt-2">
                  Loading...
                </p>
              </div>
            ) : (
              <>
                {authError && (
                  <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-600 rounded-md"> {/* Reduced padding */}
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
