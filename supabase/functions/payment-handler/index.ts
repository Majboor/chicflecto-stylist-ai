
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { amount, redirection_url, user_id } = await req.json();

    if (!amount) {
      return new Response(
        JSON.stringify({
          error: "Missing amount parameter",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the origin for proper redirection
    const url = new URL(req.url);
    const origin = url.origin.includes('localhost') 
      ? 'http://localhost:5173' 
      : url.origin.replace('functions', '');
    
    // Default fallback URL if not provided
    const fallbackUrl = redirection_url || `${origin}/payment-callback`;
    
    // We'll use the payment service API to create a payment
    const paymentServiceUrl = "https://pay.techrealm.pk/create-payment";
    
    const requestBody: any = { 
      amount: amount,
      redirection_url: fallbackUrl,
    };
    
    // Store user ID if provided to link payment to user
    if (user_id) {
      // Create subscription record for the user if doesn't exist
      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user_id)
        .eq("status", "pending")
        .maybeSingle();
      
      if (!existingSubscription) {
        // Create a pending subscription
        await supabase
          .from("subscriptions")
          .insert({
            user_id: user_id,
            status: "pending",
            amount: amount,
            is_active: false
          });
      }
      
      // Add merchant reference to track this payment
      requestBody.merchant_reference = `user_${user_id}_${Date.now()}`;
    }
    
    console.log("Sending payment request:", requestBody);

    const response = await fetch(paymentServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Payment service error: ${JSON.stringify(data)}`);
    }

    // Return the payment URL to the client
    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in payment-handler:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
