
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  
  // If still loading, show minimal loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-4 border-fashion-accent border-t-transparent rounded-full"></div>
        <p className="text-fashion-text/70 mt-1 text-sm">Loading...</p>
      </div>
    );
  }
  
  // If user is authenticated, render the children
  if (user) {
    return <>{children}</>;
  }
  
  // If not logged in, redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
