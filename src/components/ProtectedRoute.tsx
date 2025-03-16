
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Gem } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, subscriptionStatus } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const isPremium = subscriptionStatus === "active";
  
  // Reset local loading when auth loading changes
  useEffect(() => {
    if (!isLoading) {
      setLocalLoading(false);
    }
  }, [isLoading]);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("ProtectedRoute loading timeout triggered");
      setLocalLoading(false);
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timer);
  }, []);
  
  // If still in initial loading state, show a loading indicator
  if (localLoading && isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-fashion-accent border-t-transparent rounded-full mb-4"></div>
        <p className="text-fashion-text/70 mt-2">Loading your profile...</p>
        {isPremium && (
          <div className="flex items-center gap-2 mt-4">
            <Gem className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Loading Premium Content
            </span>
          </div>
        )}
      </div>
    );
  }
  
  // If not logged in after loading is complete, redirect to auth page
  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }
  
  // User is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
