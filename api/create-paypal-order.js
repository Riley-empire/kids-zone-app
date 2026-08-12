// Vercel serverless function: creates a PayPal order.
// Requires environment variables (set in Vercel project settings):
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
// Optional: PAYPAL_API_BASE (defaults to sandbox for testing)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const base = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  console.log("PAYPAL_API_BASE:", base);
  console.log("clientId present:", !!clientId, "length:", clientId ? clientId.length : 0);
  console.log("clientSecret present:", !!clientSecret, "length:", clientSecret ? clientSecret.length : 0);

  if (!clientId || !clientSecret) {
    console.error("Missing PayPal credentials in environment variables.");
    return res.status(500).json({ error: "PayPal is not configured on the server yet." });
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = await tokenRes.json();
    console.log("Token response status:", tokenRes.status);
    console.log("Token response body:", JSON.stringify(tokenData));
    if (!tokenData.access_token) {
      console.error("PayPal auth failed:", JSON.stringify(tokenData));
      return res.status(500).json({ error: "Could not authenticate with PayPal.", details: tokenData });
    }

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: "4.99" },
            description: "Kid Zone Premium Unlock",
          },
        ],
      }),
    });
    const order = await orderRes.json();
    console.log("Order response status:", orderRes.status);
    console.log("Order response body:", JSON.stringify(order));
    if (!order.id) {
      console.error("PayPal order creation failed:", JSON.stringify(order));
      return res.status(500).json({ error: "Could not create PayPal order.", details: order });
    }

    return res.status(200).json({ id: order.id });
  } catch (err) {
    console.error("Unexpected error:", err.message, err.stack);
    return res.status(500).json({ error: "Unexpected error creating order.", details: err.message });
  }
}
