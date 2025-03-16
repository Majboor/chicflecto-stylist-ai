
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
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);

  useEffect(() => {
    const handleAuthSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setSession(null);
          setIsLoading(false);
          return;
        }
        
        setSession(session);
        
        if (session) {
          // Show a message that we're about to redirect
          toast.success("Successfully signed in!");
          
          // Start a countdown for redirect
          let secondsLeft = 3;
          const timer = window.setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft <= 0) {
              clearInterval(timer);
              navigate("/");
              setIsLoading(false);
            } else {
              setRedirectTimer(secondsLeft);
            }
          }, 1000);
          
          return () => clearInterval(timer);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error in auth flow:", error);
        setSession(null);
        setIsLoading(false);
      }
    };
    
    handleAuthSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        
        if (session) {
          toast.success("Successfully signed in!");
          // Start a countdown for redirect
          let secondsLeft = 3;
          const timer = window.setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft <= 0) {
              clearInterval(timer);
              navigate("/");
            } else {
              setRedirectTimer(secondsLeft);
            }
          }, 1000);
          
          // Fix: Don't return a function here, just clear the timer if component unmounts
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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
              <div className="flex flex-col justify-center items-center h-32">
                <div className="animate-spin h-8 w-8 border-4 border-fashion-accent border-t-transparent rounded-full mb-4"></div>
                {redirectTimer !== null && (
                  <p className="text-fashion-text/70 mt-2">
                    Redirecting in {redirectTimer} seconds...
                  </p>
                )}
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
