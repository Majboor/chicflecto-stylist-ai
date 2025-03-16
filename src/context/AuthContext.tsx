
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type SubscriptionStatus = "free_trial" | "active" | "cancelled" | "expired" | "pending" | null;

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
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  async function getSubscriptionStatus(userId: string) {
    try {
      console.log("Fetching subscription status for user:", userId);
      
      // First try to get status from the database function
      const { data: funcData, error: funcError } = await supabase.rpc(
        'get_subscription_status',
        { user_uuid: userId }
      );
      
      console.log("RPC result:", { data: funcData, error: funcError });
      
      if (!funcError && funcData) {
        console.log("Setting subscription status from RPC:", funcData);
        setSubscriptionStatus(funcData as SubscriptionStatus);
        return funcData;
      }
      
      // Fallback to direct query if the function doesn't work
      console.log("RPC failed or returned no data, falling back to direct query");
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
        // Set default status to prevent getting stuck
        setSubscriptionStatus("free_trial");
        return "free_trial";
      }

      if (data) {
        // Ensure data is properly typed
        const subscription = data as {
          status?: string;
          is_active?: boolean;
          expires_at?: string;
        };
        
        // Check if the subscription has status field
        if (subscription.status) {
          const status = subscription.status as SubscriptionStatus;
          
          // If subscription is expired, update it
          if (status === "free_trial" && subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
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
          const status = isActive ? "active" : "expired";
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
              status: "free_trial",
              is_active: true,
              free_trial_used: false
            });
            
          if (insertError) {
            console.error("Error creating default subscription:", insertError);
            // Still set a default status even if insert fails
            setSubscriptionStatus("free_trial");
          } else {
            console.log("Created default free_trial subscription");
            setSubscriptionStatus("free_trial");
          }
          
          return "free_trial";
        } catch (insertErr) {
          console.error("Exception creating default subscription:", insertErr);
          // Still set a default status even if insert fails
          setSubscriptionStatus("free_trial");
          return "free_trial";
        }
      }
    } catch (error) {
      console.error("Error in getSubscriptionStatus:", error);
      // Set default status to prevent getting stuck
      setSubscriptionStatus("free_trial");
      return "free_trial";
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
        // Set a fallback status to prevent getting stuck
        setSubscriptionStatus("free_trial");
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
        // Get the session directly to avoid race conditions
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("Error getting session:", error);
          setSession(null);
          setUser(null);
          setSubscriptionStatus("free_trial"); // Set default instead of null
        } else {
          const { session } = data;
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await getSubscriptionStatus(session.user.id);
          } else {
            setSubscriptionStatus("free_trial"); // Set default instead of null
          }
        }
      } catch (error) {
        console.error("Exception in loadUserData:", error);
        setSession(null);
        setUser(null);
        setSubscriptionStatus("free_trial"); // Set default instead of null
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
        // Also set a default subscription status
        setSubscriptionStatus("free_trial");
      }
    }, 3000); // Reduced from 5000 to 3000 ms
    
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
          setSubscriptionStatus(null);
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
      setSubscriptionStatus(null);
      
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
