
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on component mount
  useEffect(() => {
    let mounted = true;
    
    async function initializeAuth() {
      try {
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Error getting session:", error);
        } else {
          const { session } = data;
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          // Clear any cached data on sign out
          localStorage.removeItem("fashion_app_free_trial_used");
          localStorage.removeItem("fashion_app_first_login");
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Simplified sign out function
  const signOut = useCallback(async () => {
    try {
      console.log("User requested sign out");
      
      // Clear state first for immediate UI update
      setUser(null);
      setSession(null);
      
      // Clear cached data
      localStorage.removeItem("fashion_app_free_trial_used");
      localStorage.removeItem("fashion_app_first_login");
      
      // Perform the actual sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out");
      } else {
        toast.success("Successfully signed out");
        // Force reload to clear any cached state
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out exception:", error);
      toast.error("An unexpected error occurred");
    }
  }, []);

  // Context value
  const value = {
    session,
    user,
    signOut,
    isLoading,
  };

  // Show minimal loading only during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-fashion-accent border-t-transparent rounded-full"></div>
        <p className="text-fashion-text/70 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
