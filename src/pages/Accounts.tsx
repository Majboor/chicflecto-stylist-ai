
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Gem, CheckCircle, Calendar, AlertCircle, CreditCard, LogOut, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/button-custom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function Accounts() {
  const { user, subscriptionStatus, signOut, refreshSubscriptionStatus, isLoading: authLoading } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const navigate = useNavigate();
  
  const isPremium = subscriptionStatus === "active";
  const isTrialActive = subscriptionStatus === "free_trial";
  const isExpired = subscriptionStatus === "expired";
  const isPending = subscriptionStatus === "pending";
  
  const isLoading = authLoading && !pageLoaded;
  
  // Refresh subscription status when page loads and mark page as loaded
  useEffect(() => {
    console.log("Accounts page loaded, auth loading:", authLoading);
    
    let mounted = true;
    
    const loadData = async () => {
      try {
        await refreshSubscriptionStatus();
      } catch (error) {
        console.error("Error loading subscription data:", error);
      } finally {
        if (mounted) {
          setPageLoaded(true);
        }
      }
    };
    
    loadData();
    
    // Set a timeout to ensure page doesn't stay in loading state forever
    const timeout = setTimeout(() => {
      if (mounted) {
        setPageLoaded(true);
      }
    }, 5000);
    
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [refreshSubscriptionStatus, authLoading]);

  const handleSignOut = async () => {
    if (actionLoading) return; // Prevent double clicks
    
    setActionLoading(true);
    try {
      console.log("User requested sign out");
      await signOut();
      // The redirect is now handled in the signOut function
    } catch (error) {
      console.error("Error in handleSignOut:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/style-advice#pricing");
  };
  
  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await refreshSubscriptionStatus();
      toast.success("Subscription status updated");
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
      toast.error("Failed to refresh status. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 md:py-40">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40 mb-2" />
                <Skeleton className="h-5 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40 mb-2" />
                <Skeleton className="h-5 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32 md:py-40">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Account</h1>
            <p className="text-fashion-text/70">
              Manage your account details and subscription
            </p>
          </div>
          <ButtonCustom 
            variant="outline" 
            onClick={handleRefreshStatus} 
            disabled={refreshing || authLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </ButtonCustom>
        </div>

        <div className="grid gap-8">
          {/* Account Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-fashion-text/70">Email</span>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm text-fashion-text/70">Account ID</span>
                <p className="font-mono text-sm truncate">{user?.id}</p>
              </div>
            </CardContent>
            <CardFooter>
              <ButtonCustom 
                variant="subtle" 
                onClick={handleSignOut} 
                className="w-full sm:w-auto"
                disabled={actionLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {actionLoading ? 'Signing out...' : 'Sign Out'}
              </ButtonCustom>
            </CardFooter>
          </Card>

          {/* Subscription Card */}
          <Card className={isPremium ? "border-purple-400" : ""}>
            <CardHeader className={isPremium ? "bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg" : ""}>
              <div className="flex justify-between items-center">
                <CardTitle>Subscription</CardTitle>
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                    <Gem className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {isTrialActive && (
                  <Badge variant="secondary">
                    Trial Active
                  </Badge>
                )}
                {isPending && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-200">
                    Pending
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="outline" className="text-red-500 border-red-200">
                    Expired
                  </Badge>
                )}
                {!subscriptionStatus && (
                  <Badge variant="outline">
                    Free
                  </Badge>
                )}
              </div>
              <CardDescription>
                {isPremium 
                  ? "You're enjoying premium features and benefits" 
                  : isPending
                    ? "Your payment is being processed"
                    : "Upgrade to premium for exclusive features"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4">
                <div className="flex items-start">
                  {isPremium ? (
                    <CheckCircle className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-fashion-text/30 mr-3 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-medium mb-1">Current Plan</h3>
                    <p className="text-sm text-fashion-text/70">
                      {isPremium 
                        ? "Premium Subscription" 
                        : isPending
                          ? "Payment Processing"
                          : isTrialActive 
                            ? "Free Trial" 
                            : "Basic (Free)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  {isPremium ? (
                    <Calendar className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                  ) : (
                    <Calendar className="h-5 w-5 text-fashion-text/30 mr-3 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-medium mb-1">Status</h3>
                    <p className="text-sm text-fashion-text/70">
                      {isPremium 
                        ? "Active" 
                        : isPending
                          ? "Payment in Progress"
                          : isTrialActive 
                            ? "Trial Period" 
                            : "Not Subscribed"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  {isPremium ? (
                    <CreditCard className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-fashion-text/30 mr-3 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-medium mb-1">Features</h3>
                    <ul className="text-sm text-fashion-text/70 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className={`h-3.5 w-3.5 mr-2 ${isPremium ? "text-purple-500" : "text-fashion-text/30"}`} />
                        Unlimited Style Recommendations
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className={`h-3.5 w-3.5 mr-2 ${isPremium ? "text-purple-500" : "text-fashion-text/30"}`} />
                        Priority Response Time
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className={`h-3.5 w-3.5 mr-2 ${isPremium ? "text-purple-500" : "text-fashion-text/30"}`} />
                        Premium Outfit Suggestions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {isPremium ? (
                <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-4">
                  <ButtonCustom variant="ghost" className="text-purple-600">
                    <Gem className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </ButtonCustom>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white px-4 py-2">
                    Premium Active
                  </Badge>
                </div>
              ) : isPending ? (
                <div className="w-full text-center">
                  <p className="text-sm text-yellow-600 mb-2">
                    Your payment is being processed. Please wait a moment.
                  </p>
                  <ButtonCustom 
                    variant="outline" 
                    onClick={handleRefreshStatus}
                    disabled={refreshing}
                    className="text-yellow-600 border-yellow-300"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Check Payment Status
                  </ButtonCustom>
                </div>
              ) : (
                <ButtonCustom 
                  variant="accent" 
                  className="w-full"
                  onClick={handleUpgrade}
                  disabled={authLoading}
                >
                  {isExpired ? "Renew Subscription" : "Upgrade to Premium"}
                </ButtonCustom>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
