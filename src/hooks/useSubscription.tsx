
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  SubscriptionStatus, 
  FREE_TRIAL, 
  ACTIVE,
  getUserSubscription,
  isFirstLogin,
  markFirstLoginComplete,
  clearSubscriptionCache
} from "@/services/subscriptionService";

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(FREE_TRIAL);
  const [isLoading, setIsLoading] = useState(false);

  // Get subscription status
  const getSubscriptionStatus = useCallback(async (userId: string): Promise<SubscriptionStatus> => {
    try {
      console.log("Getting subscription status for user:", userId);
      
      // Check if this is a first-time user
      const firstTimeUser = isFirstLogin();
      if (firstTimeUser) {
        console.log("First-time user detected, giving free trial access");
        setSubscriptionStatus(FREE_TRIAL);
        return FREE_TRIAL;
      }
      
      // Get the subscription from the database
      const subscription = await getUserSubscription(userId);
      
      if (subscription) {
        if (subscription.is_subscribed) {
          console.log("User has active subscription");
          setSubscriptionStatus(ACTIVE);
          return ACTIVE;
        }
        
        if (subscription.free_trial_used) {
          console.log("User's free trial has been used");
          const expiredStatus: SubscriptionStatus = "expired";
          setSubscriptionStatus(expiredStatus);
          return expiredStatus;
        } else {
          console.log("User's free trial is still available");
          setSubscriptionStatus(FREE_TRIAL);
          return FREE_TRIAL;
        }
      } else {
        console.log("No subscription found, defaulting to free trial");
        setSubscriptionStatus(FREE_TRIAL);
        return FREE_TRIAL;
      }
    } catch (error) {
      console.error("Error getting subscription status:", error);
      setSubscriptionStatus(FREE_TRIAL);
      return FREE_TRIAL;
    }
  }, []);

  // Refresh subscription status
  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user) return;
    
    console.log("Refreshing subscription status for user:", user.id);
    setIsLoading(true);
    
    try {
      clearSubscriptionCache(user.id);
      await getSubscriptionStatus(user.id);
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
      setSubscriptionStatus(FREE_TRIAL);
    } finally {
      setIsLoading(false);
    }
  }, [user, getSubscriptionStatus]);

  // Load subscription status when user changes
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getSubscriptionStatus(user.id).finally(() => setIsLoading(false));
    } else {
      setSubscriptionStatus(FREE_TRIAL);
    }
  }, [user, getSubscriptionStatus]);

  return {
    subscriptionStatus,
    isLoading,
    refreshSubscriptionStatus,
    isPremium: subscriptionStatus === ACTIVE,
    isFreeTrial: subscriptionStatus === FREE_TRIAL || isFirstLogin(),
  };
}
