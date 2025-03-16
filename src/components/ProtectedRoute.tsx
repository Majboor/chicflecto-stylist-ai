
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Gem } from "lucide-react";
import { toast } from "sonner";
import { ACTIVE, FREE_TRIAL } from "@/services/subscriptionService";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, subscriptionStatus } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const isPremium = subscriptionStatus === ACTIVE;
  const isFreeTrial = subscriptionStatus === FREE_TRIAL;
  
  // Reset local loading when auth loading changes
  useEffect(() => {
    if (!isLoading) {
      // Immediate response for better UX
      setLocalLoading(false);
    }
  }, [isLoading]);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
      
      // If still loading after timeout, show toast to user
      if (isLoading) {
        toast.error("Authentication taking longer than expected. Please refresh if this persists.");
      }
    }, 800); // Reduced timeout for faster response
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
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
