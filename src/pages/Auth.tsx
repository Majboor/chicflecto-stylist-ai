
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Wait a moment before navigating to ensure any other data is loaded
        setTimeout(() => {
          navigate("/");
          setIsLoading(false);
        }, 500);
      } else {
        setIsLoading(false);
      }
    }).catch(error => {
      console.error("Error getting session:", error);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          toast.success("Successfully signed in!");
          // Wait a moment before navigating to ensure any other data is loaded
          setTimeout(() => {
            navigate("/");
          }, 500);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

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
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin h-8 w-8 border-4 border-fashion-accent border-t-transparent rounded-full"></div>
              </div>
            ) : (
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
                  // Custom styling through className
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
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuthPage;
