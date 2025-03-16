
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Gem, CheckCircle, Calendar, AlertCircle, CreditCard, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";

export default function Accounts() {
  const { user, subscriptionStatus, signOut, refreshSubscriptionStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isPremium = subscriptionStatus === "active";
  const isTrialActive = subscriptionStatus === "free_trial";
  const isExpired = subscriptionStatus === "expired";
  
  // Refresh subscription status when page loads
  useEffect(() => {
    refreshSubscriptionStatus();
  }, [refreshSubscriptionStatus]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/style-advice#pricing");
  };

  return (
    <div className="container mx-auto px-4 py-32 md:py-40">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Your Account</h1>
          <p className="text-fashion-text/70">
            Manage your account details and subscription
          </p>
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
              <ButtonCustom variant="subtle" onClick={handleSignOut} className="w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
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
              ) : (
                <ButtonCustom 
                  variant="accent" 
                  className="w-full"
                  onClick={handleUpgrade}
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
