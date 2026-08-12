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

  if (!clientId || !clientSecret) {
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
    if (!tokenData.access_token) {
      return res.status(500).json({ error: "Could not authenticate with PayPal." });
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
    if (!order.id) {
      return res.status(500).json({ error: "Could not create PayPal order." });
    }

    return res.status(200).json({ id: order.id });
  } catch (err) {
    return res.status(500).json({ error: "Unexpected error creating order." });
  }
}
