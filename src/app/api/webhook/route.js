// src/app/api/webhook/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Basket from "@/model/basket";
import Order from "@/model/order";

// Ensure this runs on the Node.js runtime (Stripe SDK requires Node)
export const runtime = "nodejs";

// Optional but recommended: pin to your Stripe API version (set to your dashboard value)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20", // replace with your exact dashboard API version
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
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // Ensure DB connection for all handlers
    await connectToDatabase();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // Idempotency: don't create duplicate orders for the same session
        const existing = await Order.findOne({
          stripeCheckoutSessionId: session.id,
        });
        if (existing) {
          break;
        }

        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error("Missing userId in session.metadata");
        }

        // Load user's basket at time of purchase
        const basketItems = await Basket.find({ userId });
        if (!basketItems || basketItems.length === 0) {
          // Still record an order with zero items to align totals from Stripe
          // but usually this indicates the basket was cleared too early
          console.warn("Basket empty when processing checkout.session.completed", {
            userId,
            sessionId: session.id,
          });
        }

        // Build line items snapshot
        const items = (basketItems || []).map((item) => {
          const unitPrice = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 1;
          const lineTotal = unitPrice * quantity;
          return {
            productId: String(item.productId),
            name: String(item.name),
            imageUrl: String(item.imageUrl || ""),
            slug: String(item.slug || ""),
            unitPrice,
            quantity,
            lineTotal,
          };
        });

        const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
        const currency = session.currency || "gbp";
        const grandTotal = (session.amount_total ?? Math.round(subtotal * 100)) / 100;
        // Note: without a tax/shipping breakdown, set them to zero for now
        const taxTotal = 0;
        const shippingTotal = 0;
        const discountTotal = Math.max(0, subtotal - grandTotal);

        // Optional: map shipping/billing snapshots from Stripe
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
          billingEmail: session.customer_email || session.customer_details?.email || "",
        });

        // Clear basket after successful order creation
        await Basket.deleteMany({ userId });

        // TODO: send confirmation email here

        break;
      }

      case "checkout.session.async_payment_succeeded":
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
        // Handle other events as needed
        break;

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Catch and report any processing errors so Stripe can retry if needed
    return NextResponse.json(
      { error: `Webhook handler error: ${err.message}` },
      { status: 500 }
    );
  }
}