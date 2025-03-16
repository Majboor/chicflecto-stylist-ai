
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
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if the user is already signed in on mount
  useEffect(() => {
    // Immediately check if the user is already signed in
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setSession(null);
          setAuthError("Failed to check authentication status.");
          return;
        }
        
        if (data.session) {
          console.log("User already signed in, redirecting");
          // Clear any stale trial usage data
          localStorage.removeItem("fashion_app_free_trial_used");
          
          // For truly new users coming in, make sure we mark them as first-time
          localStorage.setItem("fashion_app_first_login", "true");
          
          // Clear subscription cache to ensure fresh data
          clearSubscriptionCache(data.session.user.id);
          
          setSession(data.session);
          toast.success("You're signed in!");
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthError("An unexpected error occurred. Please try again.");
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (newSession && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setSession(newSession);
          
          // For brand new users, set proper localStorage state
          if (event === 'SIGNED_IN') {
            console.log("Setting up first-time user state");
            localStorage.setItem("fashion_app_first_login", "true");
            localStorage.removeItem("fashion_app_free_trial_used");
            // Clear subscription cache to ensure fresh data
            clearSubscriptionCache(newSession.user.id);
          }
          
          toast.success("Successfully signed in!");
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-md">
          <div className="mb-4">
            <h1 className="fashion-heading text-2xl mb-1">Welcome to StylistAI</h1>
            <p className="fashion-subheading text-sm">
              Sign in or create an account to get personalized style advice
            </p>
          </div>
          
          <div className="glass-card p-4 rounded-xl">
            {authError && (
              <div className="mb-3 p-2 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm">
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
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthPage;
