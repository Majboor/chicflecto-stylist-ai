
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type SubscriptionStatus = "free_trial" | "active" | "cancelled" | "expired";

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

  async function getSubscriptionStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status, expires_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }

      if (data) {
        // If subscription is expired, update it
        if (data.status === "free_trial" && new Date(data.expires_at) < new Date()) {
          setSubscriptionStatus("expired");
          return "expired";
        }
        setSubscriptionStatus(data.status as SubscriptionStatus);
        return data.status;
      }
      return null;
    } catch (error) {
      console.error("Error in getSubscriptionStatus:", error);
      return null;
    }
  }

  async function refreshSubscriptionStatus() {
    if (user) {
      await getSubscriptionStatus(user.id);
    }
  }

  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await getSubscriptionStatus(session.user.id);
      }
      
      setIsLoading(false);
    }
    
    loadUserData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await getSubscriptionStatus(session.user.id);
        } else {
          setSubscriptionStatus(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    signOut,
    subscriptionStatus,
    isLoading,
    refreshSubscriptionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
