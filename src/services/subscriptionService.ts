
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Constants
const TRIAL_USAGE_KEY = "fashion_app_free_trial_used";
const SUBSCRIPTION_CACHE_KEY = "fashion_app_subscription_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const FIRST_LOGIN_KEY = "fashion_app_first_login";

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

interface CachedSubscription {
  subscription: UserSubscription | null;
  timestamp: number;
}

// Local cache
let subscriptionCache: Record<string, CachedSubscription> = {};

/**
 * Check if this is user's first login
 */
export function isFirstLogin(): boolean {
  return localStorage.getItem(FIRST_LOGIN_KEY) !== "false";
}

/**
 * Mark that user has logged in before
 */
export function markFirstLoginComplete(): void {
  localStorage.setItem(FIRST_LOGIN_KEY, "false");
}

/**
 * Retrieves a user's subscription record with caching
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  console.log("Getting user subscription for:", userId);
  
  // Check cache first
  const cached = subscriptionCache[userId];
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    console.log("Using cached subscription data");
    return cached.subscription;
  }
  
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
    
    // Update cache
    subscriptionCache[userId] = {
      subscription: data,
      timestamp: Date.now()
    };
    
    // If no subscription record exists, create one
    if (!data) {
      console.log("No subscription found, creating default subscription");
      const newSubscription = await createDefaultUserSubscription(userId);
      return newSubscription;
    }
    
    return data;
  } catch (error) {
    console.error("Exception fetching user subscription:", error);
    return null;
  }
}

/**
 * Creates a default subscription for new users
 */
export async function createDefaultUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    console.log("Creating default user subscription for:", userId);
    const defaultSub = {
      user_id: userId,
      is_subscribed: false,
      free_trial_used: false
    };
    
    const { data, error } = await supabase
      .from("user_subscriptions")
      .insert(defaultSub)
      .select()
      .single();
        
    if (error) {
      console.error("Error creating default user subscription:", error);
      return null;
    } else {
      console.log("Successfully created default user subscription");
      
      // Update cache
      subscriptionCache[userId] = {
        subscription: data,
        timestamp: Date.now()
      };
      
      return data;
    }
  } catch (error) {
    console.error("Exception creating default user subscription:", error);
    return null;
  }
}

/**
 * Clears the subscription cache for a user
 */
export function clearSubscriptionCache(userId?: string) {
  if (userId) {
    console.log("Clearing subscription cache for:", userId);
    delete subscriptionCache[userId];
  } else {
    console.log("Clearing all subscription caches");
    subscriptionCache = {};
  }
}

/**
 * Marks a user's free trial as used
 */
export async function markFreeTrialAsUsed(userId: string): Promise<boolean> {
  console.log("Marking free trial as used for user:", userId);
  
  // Update localStorage immediately
  localStorage.setItem(TRIAL_USAGE_KEY, "true");
  markFirstLoginComplete();
  
  try {
    // Update the database
    const { error } = await supabase
      .from("user_subscriptions")
      .update({ free_trial_used: true })
      .eq("user_id", userId);
      
    if (error) {
      console.error("Error marking free trial as used:", error);
      return false;
    }
    
    // Clear cache
    clearSubscriptionCache(userId);
    
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
    
    // Update localStorage immediately
    localStorage.setItem(TRIAL_USAGE_KEY, "true");
    markFirstLoginComplete();
    
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
    
    // Clear cache
    clearSubscriptionCache(userId);
    
    toast.success("Subscription activated successfully!");
    return true;
  } catch (error) {
    console.error("Exception activating subscription:", error);
    toast.error("An unexpected error occurred while activating your subscription.");
    return false;
  }
}
