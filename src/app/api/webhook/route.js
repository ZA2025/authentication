import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/model/order";
import Basket from "@/model/basket"; // optional, if you still want to clear the basket

// Ensure Node.js runtime (required by Stripe SDK)
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27", // use your exact Stripe API version
});

export async function POST(req) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Avoid creating duplicate orders
        const existingOrder = await Order.findOne({
          stripeCheckoutSessionId: session.id,
        });
        if (existingOrder) break;

        const userId = session.metadata?.userId;
        if (!userId) throw new Error("Missing userId in session.metadata");

        // ✅ Fetch confirmed purchased items directly from Stripe
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ["data.price.product"],
        });

        const items = lineItems.data.map((item) => {
          const unitPrice =
            item.amount_subtotal && item.quantity
              ? item.amount_subtotal / 100 / item.quantity
              : 0;
          const lineTotal = item.amount_subtotal ? item.amount_subtotal / 100 : 0;
          return {
            productId: item.price?.product || "",
            name: item.description || "",
            imageUrl: "", // Stripe doesn’t include this by default — optional to fill later
            slug: "",
            unitPrice,
            quantity: item.quantity,
            lineTotal,
          };
        });

        const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
        const currency = session.currency || "gbp";
        const grandTotal =
          (session.amount_total ?? Math.round(subtotal * 100)) / 100;
        const taxTotal = 0;
        const shippingTotal = 0;
        const discountTotal = Math.max(0, subtotal - grandTotal);

        const shipping = session.customer_details?.address;
        const shippingAddress = shipping
          ? {
              name: session.customer_details?.name || "",
              line1: shipping.line1 || "",
              line2: shipping.line2 || "",
              city: shipping.city || "",
              postal_code: shipping.postal_code || "",
              country: shipping.country || "",
              phone: session.customer_details?.phone || "",
            }
          : undefined;

        // ✅ Create the order record
        await Order.create({
          userId,
          email: session.customer_details?.email || session.customer_email || "",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent || "",
          currency,
          subtotal,
          taxTotal,
          shippingTotal,
          discountTotal,
          grandTotal,
          items,
          status: "paid",
          shippingAddress,
          billingEmail:
            session.customer_email || session.customer_details?.email || "",
        });

        // ✅ (Optional) clear user basket
        await Basket.deleteMany({ userId });

        console.log("✅ Order successfully created for user:", userId);
        break;
      }

      // Handle other optional Stripe events
      case "payment_intent.succeeded":
        console.log("💰 Payment intent succeeded");
        break;
      case "payment_intent.payment_failed":
        console.log("⚠️ Payment failed");
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("⚠️ Webhook handler error:", err);
    return NextResponse.json(
      { error: `Webhook handler error: ${err.message}` },
      { status: 500 }
    );
  }
}
