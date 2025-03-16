
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type SubscriptionStatus = "free_trial" | "active" | "cancelled" | "expired" | "pending" | null;

// Constants to avoid magic strings
const FREE_TRIAL = "free_trial";
const ACTIVE = "active";

// Cache key for local storage
const TRIAL_USAGE_KEY = "fashion_app_free_trial_used";

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
  
  // Helper function to mark trial as used in both DB and localStorage
  async function markFreeTrialAsUsed(userId: string) {
    console.log("Marking free trial as used for user:", userId);
    
    // Update local storage first for immediate feedback
    localStorage.setItem(TRIAL_USAGE_KEY, "true");
    
    try {
      // Then update the database
      const { error } = await supabase
        .from("subscriptions")
        .update({ 
          free_trial_used: true 
        })
        .eq("user_id", userId)
        .eq("status", FREE_TRIAL);
        
      if (error) {
        console.error("Error marking free trial as used in DB:", error);
        return false;
      }
      
      console.log("Successfully marked free trial as used in DB");
      return true;
    } catch (error) {
      console.error("Exception marking free trial as used:", error);
      return false;
    }
  }
  
  // Check if free trial has been used (from localStorage for speed)
  function hasUsedFreeTrial(): boolean {
    return localStorage.getItem(TRIAL_USAGE_KEY) === "true";
  }

  async function getSubscriptionStatus(userId: string) {
    try {
      console.log("Fetching subscription status for user:", userId);
      
      // First try to get status from database function (faster)
      const { data: funcData, error: funcError } = await supabase.rpc(
        'get_subscription_status',
        { user_uuid: userId }
      );
      
      console.log("RPC subscription status result:", { data: funcData, error: funcError });
      
      if (!funcError && funcData) {
        console.log("Setting subscription status from RPC:", funcData);
        
        // Sync localStorage with database status
        if (funcData === FREE_TRIAL) {
          // Check if free trial is marked as used in DB
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("free_trial_used")
            .eq("user_id", userId)
            .eq("status", FREE_TRIAL)
            .maybeSingle();
            
          if (subData?.free_trial_used) {
            localStorage.setItem(TRIAL_USAGE_KEY, "true");
          }
        }
        
        setSubscriptionStatus(funcData as SubscriptionStatus);
        return funcData;
      }
      
      // Fallback to direct query if the function doesn't work
      console.log("RPC failed, falling back to direct query");
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log("Direct query result:", { data, error });

      if (error) {
        console.error("Error fetching subscription:", error);
        setSubscriptionStatus(FREE_TRIAL);
        return FREE_TRIAL;
      }

      if (data) {
        // Ensure data is properly typed
        const subscription = data as {
          status?: string;
          is_active?: boolean;
          expires_at?: string;
          free_trial_used?: boolean;
        };
        
        // Sync localStorage with database
        if (subscription.status === FREE_TRIAL && subscription.free_trial_used) {
          localStorage.setItem(TRIAL_USAGE_KEY, "true");
        }
        
        // Check if the subscription has status field
        if (subscription.status) {
          const status = subscription.status as SubscriptionStatus;
          
          // If subscription is expired, update it
          if (status === FREE_TRIAL && subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
            console.log("Free trial expired, updating status to expired");
            setSubscriptionStatus("expired");
            return "expired";
          }
          
          console.log("Setting subscription status from status field:", status);
          setSubscriptionStatus(status);
          return status;
        } else {
          // If no status field, determine based on is_active
          const isActive = subscription.is_active;
          const status = isActive ? ACTIVE : "expired";
          console.log("Setting subscription status based on is_active:", status);
          setSubscriptionStatus(status);
          return status;
        }
      } else {
        // No subscription found, create a default entry
        console.log("No subscription found, creating default free_trial subscription");
        
        try {
          const { error: insertError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              status: FREE_TRIAL,
              is_active: true,
              free_trial_used: false
            });
            
          if (insertError) {
            console.error("Error creating default subscription:", insertError);
            setSubscriptionStatus(FREE_TRIAL);
          } else {
            console.log("Created default free_trial subscription");
            setSubscriptionStatus(FREE_TRIAL);
            // Reset local storage
            localStorage.removeItem(TRIAL_USAGE_KEY);
          }
          
          return FREE_TRIAL;
        } catch (insertErr) {
          console.error("Exception creating default subscription:", insertErr);
          setSubscriptionStatus(FREE_TRIAL);
          return FREE_TRIAL;
        }
      }
    } catch (error) {
      console.error("Error in getSubscriptionStatus:", error);
      setSubscriptionStatus(FREE_TRIAL);
      return FREE_TRIAL;
    }
  }

  async function refreshSubscriptionStatus() {
    if (user) {
      setIsLoading(true);
      try {
        await getSubscriptionStatus(user.id);
      } catch (error) {
        console.error("Error refreshing subscription status:", error);
        toast.error("Failed to refresh subscription status");
        setSubscriptionStatus(FREE_TRIAL);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    console.log("AuthContext useEffect running");
    let isMounted = true;
    
    async function loadUserData() {
      if (!isMounted) return;
      
      console.log("Loading user data...");
      setIsLoading(true);
      
      try {
        // Get the session directly for faster response
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("Error getting session:", error);
          setSession(null);
          setUser(null);
          setSubscriptionStatus(FREE_TRIAL);
        } else {
          const { session } = data;
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await getSubscriptionStatus(session.user.id);
          } else {
            setSubscriptionStatus(FREE_TRIAL);
          }
        }
      } catch (error) {
        console.error("Exception in loadUserData:", error);
        setSession(null);
        setUser(null);
        setSubscriptionStatus(FREE_TRIAL);
      } finally {
        // Always mark auth as initialized and not loading when done
        if (isMounted) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
        console.log("User data loading complete");
      }
    }
    
    // Set a timeout to ensure we don't get stuck loading forever
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Loading timeout triggered, forcing auth initialization");
        setAuthInitialized(true);
        setIsLoading(false);
        setSubscriptionStatus(FREE_TRIAL);
      }
    }, 2000); // Reduced for faster response
    
    loadUserData();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        
        if (!isMounted) return;
        
        // Update session and user immediately
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            setIsLoading(true);
            await getSubscriptionStatus(newSession.user.id);
            if (isMounted) setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear subscription status on sign out
          setSubscriptionStatus(FREE_TRIAL);
          // Clear local storage on sign out
          localStorage.removeItem(TRIAL_USAGE_KEY);
        }
        
        // Always mark auth as initialized and not loading when done
        if (isMounted) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
      }
    );
    
    return () => {
      console.log("Cleaning up auth context");
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log("Signing out user...");
      setIsLoading(true);
      
      // Clear state first to prevent UI flicker
      setUser(null);
      setSession(null);
      setSubscriptionStatus(FREE_TRIAL);
      localStorage.removeItem(TRIAL_USAGE_KEY);
      
      // Then perform the actual sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during sign out:", error);
        toast.error("Failed to sign out. Please try again.");
        // Try to recover the session if sign out failed
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } else {
        console.log("Successfully signed out");
        toast.success("Successfully signed out");
        // Force a reload to clear any cached state
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Exception during sign out:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    signOut,
    subscriptionStatus,
    isLoading,
    refreshSubscriptionStatus,
  };

  // Show loading only for a short time, then render children anyway
  // This prevents getting stuck on the loading screen
  return (
    <AuthContext.Provider value={value}>
      {authInitialized ? children : (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-fashion-accent border-t-transparent rounded-full mb-4"></div>
          <p className="text-fashion-text">Initializing authentication...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export the helper for use in components that need to mark trial as used
export { FREE_TRIAL, ACTIVE };
