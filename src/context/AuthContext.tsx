
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type SubscriptionStatus = "free_trial" | "active" | "cancelled" | "expired" | "pending";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  subscriptionStatus: SubscriptionStatus | null;
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
      // First try to get status from the database function
      const { data: funcData, error: funcError } = await supabase.rpc(
        'get_subscription_status',
        { user_uuid: userId }
      );
      
      if (!funcError && funcData) {
        setSubscriptionStatus(funcData as SubscriptionStatus);
        return funcData;
      }
      
      // Fallback to direct query if the function doesn't work
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        setSubscriptionStatus(null);
        return null;
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
            setSubscriptionStatus("expired");
            return "expired";
          }
          
          setSubscriptionStatus(status);
          return status;
        } else {
          // If no status field, determine based on is_active
          const isActive = subscription.is_active;
          const status = isActive ? "active" : "expired";
          setSubscriptionStatus(status);
          return status;
        }
      } else {
        // No subscription found, set to null
        setSubscriptionStatus(null);
        return null;
      }
    } catch (error) {
      console.error("Error in getSubscriptionStatus:", error);
      setSubscriptionStatus(null);
      return null;
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
          setSubscriptionStatus(null);
        } else {
          const { session } = data;
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await getSubscriptionStatus(session.user.id);
          } else {
            setSubscriptionStatus(null);
          }
        }
      } catch (error) {
        console.error("Exception in loadUserData:", error);
        setSession(null);
        setUser(null);
        setSubscriptionStatus(null);
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
      }
    }, 5000);
    
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
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error during sign out:", error);
      toast.error("Failed to sign out. Please try again.");
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
