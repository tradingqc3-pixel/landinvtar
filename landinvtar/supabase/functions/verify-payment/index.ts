import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing mandatory payment fields");
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")?.trim();
    if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET not set");

    // 1. Verify Signature
    const encoder = new TextEncoder();
    const verificationData = `${razorpay_order_id}|${razorpay_payment_id}`;
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(verificationData));
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const computedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    if (computedSignature !== razorpay_signature) {
      await supabase.rpc('fail_razorpay_payment', {
        p_razorpay_order_id: razorpay_order_id,
        p_error_code: 'INVALID_SIGNATURE',
        p_error_desc: 'Signature mismatch'
      });
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Get Order Amount
    const { data: orderData, error: fetchError } = await supabase
      .from('payment_orders')
      .select('amount, status')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !orderData) throw new Error("Order not found");
    if (orderData.status === 'paid') return new Response(JSON.stringify({ success: true, message: "Already verified" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // 3. Confirm Payment via RPC
    const { data: rpcResult, error: rpcError } = await supabase.rpc('confirm_razorpay_payment', {
      p_razorpay_order_id: razorpay_order_id,
      p_razorpay_payment_id: razorpay_payment_id,
      p_razorpay_signature: razorpay_signature,
      p_amount: orderData.amount
    });

    if (rpcError) throw new Error("Wallet update failed: " + rpcError.message);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Wallet credited successfully",
        new_balance: rpcResult.new_balance
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[VerifyPayment] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
