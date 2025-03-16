
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Gem } from "lucide-react";
import { toast } from "sonner";
import { ACTIVE, FREE_TRIAL, isFirstLogin } from "@/services/subscriptionService";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, subscriptionStatus } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  
  // Give first-time users free trial status automatically
  const firstTimeUser = isFirstLogin();
  const isPremium = subscriptionStatus === ACTIVE;
  const isFreeTrial = subscriptionStatus === FREE_TRIAL || firstTimeUser;
  
  useEffect(() => {
    // If this is a first-time user, log it
    if (firstTimeUser && user) {
      console.log("First-time user detected in ProtectedRoute, giving free trial access");
    }
  }, [firstTimeUser, user]);
  
  // Reset local loading when auth loading changes
  useEffect(() => {
    if (!isLoading) {
      // Short delay for better UX
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Handle component unmount
  useEffect(() => {
    return () => {
      setLocalLoading(false);
    };
  }, []);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localLoading) {
        setLocalLoading(false);
        
        // If still loading after timeout, show toast to user
        if (isLoading) {
          toast.error("Authentication taking longer than expected. Please refresh if this persists.");
        }
      }
    }, 2000); // 2 second timeout
    
    return () => clearTimeout(timer);
  }, [isLoading, localLoading]);
  
  // If still in initial loading state, show a loading indicator
  if (localLoading && isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-fashion-accent border-t-transparent rounded-full"></div>
        <p className="text-fashion-text/70 mt-2">Loading your profile...</p>
        {(isPremium || isFreeTrial) && (
          <div className="flex items-center gap-2 mt-4">
            <Gem className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {isPremium ? "Loading Premium Content" : "Free Trial Active"}
            </span>
          </div>
        )}
      </div>
    );
  }
  
  // If not logged in after loading is complete, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // User is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
