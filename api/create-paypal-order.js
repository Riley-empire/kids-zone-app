export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const base = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
  const clientId = (process.env.PAYPAL_CLIENT_ID || "").trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || "").trim();

  console.log("PAYPAL_API_BASE:", base);
  console.log("clientId present:", !!clientId, "length:", clientId.length);
  console.log("clientSecret present:", !!clientSecret, "length:", clientSecret.length);

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
    console.log("Token response status:", tokenRes.status);
    const tokenData = await tokenRes.json();
    console.log("Token response body:", tokenData);

    if (!tokenData.access_token) {
      console.error("PayPal auth failed:", tokenData);
      return res.status(500).json({ error: "Could not authenticate with PayPal.", detail: tokenData });
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
      console.error("Order creation failed:", order);
      return res.status(500).json({ error: "Could not create PayPal order.", detail: order });
    }

    return res.status(200).json({ id: order.id });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected error creating order." });
  }
}
