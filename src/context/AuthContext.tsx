
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { 
  SubscriptionStatus, 
  FREE_TRIAL, 
  ACTIVE,
  isUserSubscribed, 
  hasUsedFreeTrial,
  getUserSubscription,
  clearSubscriptionCache,
  isFirstLogin,
  markFirstLoginComplete
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
  const getSubscriptionStatus = useCallback(async (userId: string): Promise<SubscriptionStatus> => {
    try {
      console.log("Getting subscription status for user:", userId);
      
      // Check if this is a first-time user
      const firstTimeUser = isFirstLogin();
      if (firstTimeUser) {
        console.log("First-time user detected in AuthContext, giving free trial access");
        setSubscriptionStatus(FREE_TRIAL);
        return FREE_TRIAL;
      }
      
      // Get the subscription directly from the user_subscriptions table
      const subscription = await getUserSubscription(userId);
      
      if (subscription) {
        console.log("Found subscription:", subscription);
        
        // If user has an active subscription
        if (subscription.is_subscribed) {
          console.log("User has active subscription");
          setSubscriptionStatus(ACTIVE);
          return ACTIVE;
        }
        
        // Check free trial status
        if (subscription.free_trial_used) {
          // Free trial used, consider expired
          console.log("User's free trial is used");
          const freeTrialStatus: SubscriptionStatus = "expired";
          setSubscriptionStatus(freeTrialStatus);
          return freeTrialStatus;
        } else {
          // Free trial not used yet
          console.log("User's free trial is available");
          setSubscriptionStatus(FREE_TRIAL);
          return FREE_TRIAL;
        }
      } else {
        console.log("No subscription found, creating default entry");
        // No subscription found, create a default entry
        await createDefaultUserSubscription(userId);
        // Always default to FREE_TRIAL for new users
        setSubscriptionStatus(FREE_TRIAL);
        return FREE_TRIAL;
      }
    } catch (error) {
      console.error("Error getting subscription status:", error);
      // Default to free trial on error for better user experience
      setSubscriptionStatus(FREE_TRIAL);
      return FREE_TRIAL;
    }
  }, []);

  // Helper function to create a default user subscription with free trial
  const createDefaultUserSubscription = async (userId: string): Promise<void> => {
    try {
      console.log("Creating default user subscription for:", userId);
      const { error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          is_subscribed: false,
          free_trial_used: false // Explicitly set to false for new users
        });
        
      if (error) {
        console.error("Error creating default user subscription:", error);
      } else {
        console.log("Successfully created default user subscription with free trial");
        // Explicitly set free trial status
        setSubscriptionStatus(FREE_TRIAL);
      }
    } catch (error) {
      console.error("Exception creating default user subscription:", error);
    }
  };

  // Function to refresh subscription status with improved error handling
  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user) return;
    
    console.log("Refreshing subscription status for user:", user.id);
    setIsLoading(true);
    
    try {
      // Clear cache to ensure fresh data
      clearSubscriptionCache(user.id);
      await getSubscriptionStatus(user.id);
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
      // Default to free trial on error for better user experience
      setSubscriptionStatus(FREE_TRIAL);
    } finally {
      setIsLoading(false);
    }
  }, [user, getSubscriptionStatus]);

  // Initialize auth state on component mount
  useEffect(() => {
    let mounted = true;
    
    async function initializeAuth() {
      setIsLoading(true);
      console.log("Initializing auth state");
      
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
          console.log("Session exists, getting subscription status");
          await getSubscriptionStatus(session.user.id);
        } else {
          console.log("No session, defaulting to free trial");
          setSubscriptionStatus(FREE_TRIAL);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Default to free trial on error
        setSubscriptionStatus(FREE_TRIAL);
      } finally {
        if (mounted) {
          setAuthInitialized(true);
          setIsLoading(false);
          console.log("Auth initialization complete");
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
    }, 800); // Reduced timeout for faster loading
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log("User signed in, getting fresh subscription status");
          if (newSession?.user) {
            setIsLoading(true);
            // Clear cache for fresh data on sign in
            clearSubscriptionCache(newSession.user.id);
            await getSubscriptionStatus(newSession.user.id);
            if (mounted) setIsLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed, updating subscription status");
          if (newSession?.user) {
            setIsLoading(true);
            await getSubscriptionStatus(newSession.user.id);
            if (mounted) setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, resetting subscription status");
          setSubscriptionStatus(FREE_TRIAL);
          localStorage.removeItem("fashion_app_free_trial_used");
          // Clear all subscription caches on sign out
          clearSubscriptionCache();
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
  }, [getSubscriptionStatus]);

  // Simplified sign out function
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("User requested sign out");
      
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
  }, []);

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
