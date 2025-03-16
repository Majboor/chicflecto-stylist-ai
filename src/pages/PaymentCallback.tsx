
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

const PaymentCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshSubscriptionStatus } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  useEffect(() => {
    async function handlePaymentCallback() {
      try {
        const queryParams = new URLSearchParams(location.search);
        const success = queryParams.get("success") === "true";
        const txnResponseCode = queryParams.get("txn_response_code");
        const message = queryParams.get("data.message");
        
        console.log("Payment callback received:", {
          success,
          txnResponseCode,
          message,
          queryParams: Object.fromEntries(queryParams.entries())
        });
        
        setPaymentSuccessful(success && txnResponseCode === "APPROVED");
        
        if (!user) {
          console.error("No authenticated user found");
          toast.error("Please log in to complete the payment process");
          navigate("/auth");
          return;
        }
        
        if (success && txnResponseCode === "APPROVED") {
          // Get the active subscription
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          if (subscriptionError && subscriptionError.code !== "PGRST116") {
            console.error("Error fetching subscription:", subscriptionError);
            toast.error("Could not process your subscription");
            return;
          }
          
          const subscriptionId = subscriptionData?.id;
          
          // Record the payment transaction
          const { error: transactionError } = await supabase
            .from("payment_transactions")
            .insert({
              user_id: user.id,
              subscription_id: subscriptionId,
              amount: queryParams.get("amount_cents") 
                ? parseInt(queryParams.get("amount_cents")!) / 100 
                : 14,
              payment_reference: queryParams.get("merchant_order_id"),
              transaction_id: queryParams.get("id"),
              status: "completed",
              payment_data: Object.fromEntries(queryParams.entries())
            });
            
          if (transactionError) {
            console.error("Error recording transaction:", transactionError);
            toast.error("Payment recorded but subscription update failed");
            return;
          }
          
          // Update the subscription to active
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({
              status: "active",
              payment_reference: queryParams.get("merchant_order_id"),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
              is_active: true
            })
            .eq("id", subscriptionId);
            
          if (updateError) {
            console.error("Error updating subscription:", updateError);
            toast.error("Payment completed but subscription update failed");
            return;
          }
          
          await refreshSubscriptionStatus();
          toast.success("Payment successful! Your subscription is now active.");
        } else {
          // Record the failed payment
          if (user) {
            await supabase
              .from("payment_transactions")
              .insert({
                user_id: user.id,
                amount: queryParams.get("amount_cents") 
                  ? parseInt(queryParams.get("amount_cents")!) / 100 
                  : 14,
                payment_reference: queryParams.get("merchant_order_id"),
                transaction_id: queryParams.get("id"),
                status: "failed",
                payment_data: Object.fromEntries(queryParams.entries())
              });
          }
          
          toast.error("Payment was not successful. Please try again.");
        }
      } catch (error) {
        console.error("Error processing payment callback:", error);
        toast.error("An error occurred while processing your payment");
      } finally {
        setIsProcessing(false);
      }
    }
    
    handlePaymentCallback();
  }, [location.search, user, navigate, refreshSubscriptionStatus]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-md">
          <div className="glass-card p-8 rounded-xl text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <div className="animate-spin h-12 w-12 border-4 border-fashion-accent border-t-transparent rounded-full mx-auto"></div>
                <h2 className="text-xl font-semibold">Processing Payment</h2>
                <p className="text-fashion-text/70">Please wait while we verify your payment...</p>
              </div>
            ) : paymentSuccessful ? (
              <div className="space-y-4">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <Check className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold">Payment Successful!</h2>
                <p className="text-fashion-text/70">
                  Your subscription has been activated. You now have unlimited access to all features.
                </p>
                <button
                  className="mt-6 px-6 py-2 bg-fashion-accent text-white rounded-full hover:bg-fashion-accent/90 transition-colors"
                  onClick={() => navigate("/style-advice")}
                >
                  Start Using Premium Features
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <X className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold">Payment Failed</h2>
                <p className="text-fashion-text/70">
                  We couldn't process your payment. Please try again or contact support.
                </p>
                <button
                  className="mt-6 px-6 py-2 bg-fashion-accent text-white rounded-full hover:bg-fashion-accent/90 transition-colors"
                  onClick={() => navigate("/style-advice#pricing")}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentCallback;
