import { useNavigate } from "react-router-dom";
import { Gem, CheckCircle, Calendar, AlertCircle, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/button-custom";

export default function Accounts() {
  const navigate = useNavigate();

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
                <span className="text-sm text-fashion-text/70">Status</span>
                <p className="font-medium">Guest User</p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Subscription</CardTitle>
                <Badge variant="outline">
                  Free
                </Badge>
              </div>
              <CardDescription>
                Upgrade to premium for exclusive features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-fashion-text/30 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Current Plan</h3>
                    <p className="text-sm text-fashion-text/70">
                      Basic (Free)
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-fashion-text/30 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Status</h3>
                    <p className="text-sm text-fashion-text/70">
                      Not Subscribed
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-fashion-text/30 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Features</h3>
                    <ul className="text-sm text-fashion-text/70 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-fashion-text/30" />
                        Unlimited Style Recommendations
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-fashion-text/30" />
                        Priority Response Time
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-fashion-text/30" />
                        Premium Outfit Suggestions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <ButtonCustom 
                variant="accent" 
                className="w-full"
                onClick={handleUpgrade}
              >
                Upgrade to Premium
              </ButtonCustom>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
