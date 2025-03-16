
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Constants
const TRIAL_USAGE_KEY = "fashion_app_free_trial_used";

// Types
export type SubscriptionStatus = "free_trial" | "active" | "cancelled" | "expired" | "pending" | null;
export const FREE_TRIAL: SubscriptionStatus = "free_trial";
export const ACTIVE: SubscriptionStatus = "active";

interface UserSubscription {
  id: string;
  user_id: string;
  is_subscribed: boolean;
  free_trial_used: boolean;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Retrieves a user's subscription record
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching user subscription:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Exception fetching user subscription:", error);
    return null;
  }
}

/**
 * Checks if a user has an active subscription
 */
export async function isUserSubscribed(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription?.is_subscribed || false;
}

/**
 * Checks if a user has used their free trial
 */
export function hasUsedFreeTrial(): boolean {
  return localStorage.getItem(TRIAL_USAGE_KEY) === "true";
}

/**
 * Marks a user's free trial as used
 */
export async function markFreeTrialAsUsed(userId: string): Promise<boolean> {
  console.log("Marking free trial as used for user:", userId);
  
  // Update localStorage immediately for fast UI response
  localStorage.setItem(TRIAL_USAGE_KEY, "true");
  
  try {
    // Then update the database
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ free_trial_used: true })
      .eq("user_id", userId);
      
    if (error) {
      console.error("Error marking free trial as used:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception marking free trial as used:", error);
    return false;
  }
}

/**
 * Activates a user's subscription after successful payment
 */
export async function activateUserSubscription(
  userId: string, 
  paymentReference: string,
  durationDays = 30
): Promise<boolean> {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);
    
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        is_subscribed: true,
        payment_reference: paymentReference,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
      
    if (error) {
      console.error("Error activating subscription:", error);
      toast.error("Failed to activate subscription.");
      return false;
    }
    
    toast.success("Subscription activated successfully!");
    return true;
  } catch (error) {
    console.error("Exception activating subscription:", error);
    toast.error("An unexpected error occurred while activating your subscription.");
    return false;
  }
}
