
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { 
  SubscriptionStatus, 
  FREE_TRIAL, 
  ACTIVE,
  isUserSubscribed, 
  hasUsedFreeTrial,
  getUserSubscription
} from "@/services/subscriptionService";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  subscriptionStatus: SubscriptionStatus;
  isLoading: boolean;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(FREE_TRIAL);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Optimized function to get subscription status
  const getSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus> => {
    try {
      // First check if we can get the status from user_subscriptions
      const subscription = await getUserSubscription(userId);
      
      if (subscription) {
        // If user has an active subscription
        if (subscription.is_subscribed) {
          setSubscriptionStatus(ACTIVE);
          return ACTIVE;
        }
        
        // If user has a free trial
        if (subscription.free_trial_used) {
          // Free trial used, consider expired
          const freeTrialStatus: SubscriptionStatus = "expired";
          setSubscriptionStatus(freeTrialStatus);
          return freeTrialStatus;
        } else {
          // Free trial not used yet
          setSubscriptionStatus(FREE_TRIAL);
          return FREE_TRIAL;
        }
      }
      
      // Fallback to RPC function for backward compatibility
      const { data, error } = await supabase.rpc(
        'get_subscription_status',
        { user_uuid: userId }
      );
      
      if (!error && data) {
        console.log("Subscription status from RPC:", data);
        
        // If it's a free trial, check localStorage for usage status
        if (data === FREE_TRIAL && hasUsedFreeTrial()) {
          // Verify the database has the correct state
          await supabase
            .from("subscriptions")
            .update({ free_trial_used: true })
            .eq("user_id", userId)
            .eq("status", FREE_TRIAL);
        }
        
        // Ensure we're setting the correct type
        const statusValue = data as SubscriptionStatus;
        setSubscriptionStatus(statusValue);
        return statusValue;
      }
      
      // No subscription found, create a default entry
      await createDefaultUserSubscription(userId);
      return FREE_TRIAL;
    } catch (error) {
      console.error("Error getting subscription status:", error);
      setSubscriptionStatus(FREE_TRIAL);
      return FREE_TRIAL;
    }
  };

  // Helper function to create a default user subscription
  const createDefaultUserSubscription = async (userId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          is_subscribed: false,
          free_trial_used: hasUsedFreeTrial()
        });
        
      if (error) {
        console.error("Error creating default user subscription:", error);
      } else {
        console.log("Created default user subscription with free trial");
        setSubscriptionStatus(FREE_TRIAL);
      }
    } catch (error) {
      console.error("Exception creating default user subscription:", error);
    }
  };

  // Function to refresh subscription status
  const refreshSubscriptionStatus = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await getSubscriptionStatus(user.id);
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
      setSubscriptionStatus(FREE_TRIAL);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    let mounted = true;
    
    async function initializeAuth() {
      setIsLoading(true);
      
      try {
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Error getting session:", error);
          setAuthInitialized(true);
          setIsLoading(false);
          return;
        }
        
        const { session } = data;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await getSubscriptionStatus(session.user.id);
        } else {
          setSubscriptionStatus(FREE_TRIAL);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
      }
    }
    
    // Set a short timeout to prevent getting stuck
    const timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.log("Auth loading timeout triggered");
        setAuthInitialized(true);
        setIsLoading(false);
      }
    }, 1500);
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            setIsLoading(true);
            await getSubscriptionStatus(newSession.user.id);
            if (mounted) setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setSubscriptionStatus(FREE_TRIAL);
          localStorage.removeItem("fashion_app_free_trial_used");
        }
        
        setAuthInitialized(true);
        setIsLoading(false);
      }
    );
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Simplified sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear state first for immediate UI update
      setUser(null);
      setSession(null);
      setSubscriptionStatus(FREE_TRIAL);
      
      // Perform the actual sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out");
        
        // Try to recover session if sign out failed
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } else {
        toast.success("Successfully signed out");
        // Force reload to clear any cached state
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out exception:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    session,
    user,
    signOut,
    subscriptionStatus,
    isLoading,
    refreshSubscriptionStatus,
  };

  // Render children or loading screen
  return (
    <AuthContext.Provider value={value}>
      {authInitialized ? children : (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-fashion-accent border-t-transparent rounded-full"></div>
          <p className="text-fashion-text/70 mt-2">Initializing...</p>
        </div>
      )}
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

export { FREE_TRIAL, ACTIVE };
