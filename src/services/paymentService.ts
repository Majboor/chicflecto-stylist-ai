
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentResponse {
  success: boolean;
  message: string;
  paymentUrl?: string;
  paymentId?: string;
}

/**
 * Creates a new payment request
 */
export async function createPayment(userId: string, amount = 5141): Promise<PaymentResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("payment-handler", {
      body: {
        amount: amount,
        user_id: userId,
        redirection_url: `${window.location.origin}/payment-callback`
      }
    });
    
    if (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to initiate payment process.");
      return { success: false, message: error.message };
    }
    
    if (!data.payment_url) {
      console.error("No payment URL returned:", data);
      toast.error("Payment service unavailable. Please try again later.");
      return { success: false, message: "Payment service unavailable" };
    }
    
    return {
      success: true,
      message: "Payment initiated successfully",
      paymentUrl: data.payment_url,
      paymentId: data.id
    };
  } catch (error: any) {
    console.error("Exception creating payment:", error);
    toast.error("An unexpected error occurred while processing your payment request.");
    return { success: false, message: error.message };
  }
}

/**
 * Verifies a payment by ID
 */
export async function verifyPaymentById(paymentId: string): Promise<boolean> {
  try {
    const response = await fetch("https://pay.techrealm.pk/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error verifying payment:", data);
      return false;
    }
    
    return data.success === true;
  } catch (error) {
    console.error("Exception verifying payment:", error);
    return false;
  }
}
