import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { activateUserSubscription } from "@/services/subscriptionService";
import { verifyPaymentById } from "@/services/paymentService";

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
        const paymentId = queryParams.get("id");
        const merchantOrderId = queryParams.get("merchant_order_id");
        
        setPaymentSuccessful(success && txnResponseCode === "APPROVED");
        
        if (!user) {
          toast.error("Please log in to complete the payment process");
          navigate("/auth");
          return;
        }
        
        if (success && txnResponseCode === "APPROVED") {
          // Record the transaction for audit
          await recordPaymentTransaction(
            user.id, 
            queryParams.get("amount_cents") ? parseInt(queryParams.get("amount_cents")!) / 100 : 14,
            merchantOrderId,
            paymentId,
            "completed",
            Object.fromEntries(queryParams.entries())
          );
          
          // Activate the subscription
          const activated = await activateUserSubscription(user.id, merchantOrderId || "manual_activation");
          
          if (activated) {
            // Refresh subscription status to update UI
            await refreshSubscriptionStatus();
            
            // Redirect to accounts page after short delay
            setTimeout(() => {
              navigate("/accounts");
            }, 2000);
          }
        } else if (paymentId && !paymentSuccessful) {
          // Try fallback verification if the redirect parameters are unclear
          const verified = await verifyPaymentById(paymentId);
          
          if (verified) {
            // Payment verified through fallback, activate subscription
            await recordPaymentTransaction(
              user.id,
              14, // Default amount
              merchantOrderId,
              paymentId,
              "completed",
              Object.fromEntries(queryParams.entries())
            );
            
            const activated = await activateUserSubscription(user.id, merchantOrderId || paymentId);
            
            if (activated) {
              setPaymentSuccessful(true);
              await refreshSubscriptionStatus();
              setTimeout(() => {
                navigate("/accounts");
              }, 2000);
              return;
            }
          }
          
          // Record failed payment
          await recordPaymentTransaction(
            user.id,
            queryParams.get("amount_cents") ? parseInt(queryParams.get("amount_cents")!) / 100 : 14,
            merchantOrderId,
            paymentId,
            "failed",
            Object.fromEntries(queryParams.entries())
          );
          
          toast.error("Payment was not successful. Please try again.");
        }
      } catch (error) {
        console.error("Payment callback error:", error);
        toast.error("An error occurred while processing your payment");
      } finally {
        setIsProcessing(false);
      }
    }
    
    handlePaymentCallback();
  }, [location.search, user, navigate, refreshSubscriptionStatus]);

  // Helper to record payment transactions
  async function recordPaymentTransaction(
    userId: string,
    amount: number,
    paymentReference: string | null,
    transactionId: string | null,
    status: string,
    paymentData: any
  ) {
    try {
      await supabase
        .from("payment_transactions")
        .insert({
          user_id: userId,
          amount: amount,
          payment_reference: paymentReference,
          transaction_id: transactionId,
          status: status,
          payment_data: paymentData
        });
    } catch (error) {
      console.error("Error recording payment transaction:", error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
                <p className="text-sm text-fashion-text/50 mt-4">
                  Redirecting to your account page...
                </p>
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
    </div>
  );
};

export default PaymentCallback;
