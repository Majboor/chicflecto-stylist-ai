
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { isFirstLogin, markFirstLoginComplete } from "@/services/subscriptionService";

const AuthPage = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          return;
        }
        
        if (data.session) {
          console.log("User already signed in, redirecting");
          toast.success("You're already signed in!");
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (session && event === 'SIGNED_IN') {
          // Mark first login for new users
          if (isFirstLogin()) {
            console.log("First login detected, setting up user");
            localStorage.setItem("fashion_app_first_login", "true");
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
      
      <main className="flex-1 pt-2 pb-4">
        <div className="container mx-auto px-4 max-w-md">
          <div className="mb-2">
            <h1 className="fashion-heading text-2xl mb-0.5">Welcome to StylistAI</h1>
            <p className="fashion-subheading text-sm">
              Sign in or create an account to get personalized style advice
            </p>
          </div>
          
          <div className="glass-card p-3 rounded-xl">
            {authError && (
              <div className="mb-2 p-2 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm">
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
                  },
                  container: {
                    gap: '0.5rem'
                  },
                  message: {
                    margin: '0.25rem 0'
                  },
                  anchor: {
                    margin: '0.25rem 0'
                  },
                  divider: {
                    margin: '0.5rem 0'
                  },
                  label: {
                    margin: '0.25rem 0'
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
