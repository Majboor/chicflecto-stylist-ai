
import { useState, useCallback } from "react";

export type SubscriptionStatus = "free_trial" | "active" | "cancelled" | "expired" | "pending" | null;

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("free_trial");
  const [isLoading, setIsLoading] = useState(false);

  // Refresh subscription status (no-op without auth)
  const refreshSubscriptionStatus = useCallback(async () => {
    setIsLoading(true);
    // Without auth, just simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsLoading(false);
  }, []);

  return {
    subscriptionStatus,
    isLoading,
    refreshSubscriptionStatus,
    isPremium: subscriptionStatus === "active",
    isFreeTrial: subscriptionStatus === "free_trial",
  };
}
