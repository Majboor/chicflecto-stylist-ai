
import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Gem } from "lucide-react";
import { isFirstLogin } from "@/services/subscriptionService";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, subscriptionStatus, refreshSubscriptionStatus } = useAuth();
  
  // Get first-time user status from localStorage
  const firstTimeUser = isFirstLogin();
  const isPremium = subscriptionStatus === "active";
  // For first-time users, we force the free trial status regardless of DB setting
  const isFreeTrial = subscriptionStatus === "free_trial" || firstTimeUser;
  
  useEffect(() => {
    // If this is a first-time user, log it and ensure subscription status is refreshed
    if (firstTimeUser && user) {
      console.log("First-time user detected in ProtectedRoute, giving free trial access");
      // Force a refresh of the subscription status to ensure free trial is properly set
      refreshSubscriptionStatus();
    }
  }, [firstTimeUser, user, refreshSubscriptionStatus]);
  
  // Skip authentication check for first-time users entirely
  if (firstTimeUser) {
    console.log("First-time user detected in ProtectedRoute, bypassing auth check");
    return <>{children}</>;
  }
  
  // If user is authenticated, render the children
  if (user) {
    return <>{children}</>;
  }
  
  // If still in a loading state, show a minimal loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-4 border-fashion-accent border-t-transparent rounded-full"></div>
        <p className="text-fashion-text/70 mt-1 text-sm">Loading...</p>
        {(isPremium || isFreeTrial) && (
          <div className="flex items-center gap-1 mt-2">
            <Gem className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {isPremium ? "Premium" : "Free Trial"}
            </span>
          </div>
        )}
      </div>
    );
  }
  
  // If not logged in after loading is complete, redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
