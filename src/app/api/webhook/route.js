import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/model/order";
import Basket from "@/model/basket";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27",
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
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    await connectToDatabase();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        console.log("📦 checkout.session.completed for:", userId);

        if (!userId) throw new Error("Missing userId in session metadata");

        // Prevent duplicates (unique index)
        const existingOrder = await Order.findOne({
          stripeCheckoutSessionId: session.id,
        });
        if (existingOrder) {
          console.log("⚠️ Order already exists for session:", session.id);
          break;
        }

        console.log("🟦 Fetching Stripe line items...");
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        // ✅ Safely normalize all line items
        const items = lineItems.data.map((item) => {
          const unitPrice = item.amount_subtotal
            ? item.amount_subtotal / 100 / (item.quantity || 1)
            : 0;
          const lineTotal = item.amount_subtotal ? item.amount_subtotal / 100 : 0;
          return {
            productId: String(item.price?.product || "unknown_product"),
            name: String(item.description || "Unnamed item"),
            imageUrl: "",
            slug: "",
            unitPrice: Number(unitPrice),
            quantity: Number(item.quantity || 1),
            lineTotal: Number(lineTotal),
          };
        });

        const subtotal = items.reduce((sum, it) => sum + it.lineTotal, 0);
        const grandTotal = session.amount_total
          ? session.amount_total / 100
          : subtotal;
        const currency = session.currency || "gbp";

        // Always ensure required fields exist
        const orderData = {
          userId,
          email: session.customer_details?.email || session.customer_email || "",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent || "",
          currency,
          subtotal: Number(subtotal || grandTotal),
          taxTotal: 0,
          shippingTotal: 0,
          discountTotal: 0,
          grandTotal: Number(grandTotal),
          items,
          status: "paid",
          shippingAddress: {
            name: session.customer_details?.name || "",
            line1: session.customer_details?.address?.line1 || "",
            line2: session.customer_details?.address?.line2 || "",
            city: session.customer_details?.address?.city || "",
            postal_code: session.customer_details?.address?.postal_code || "",
            country: session.customer_details?.address?.country || "",
            phone: session.customer_details?.phone || "",
          },
          billingEmail:
            session.customer_email || session.customer_details?.email || "",
        };

        console.log("🟩 Creating Order:", orderData);
        await Order.create(orderData);
        console.log("✅ Order successfully created for user:", userId);

        // ✅ Clear basket safely
        try {
          await Basket.deleteMany({ userId });
          console.log("🧹 Basket cleared for:", userId);
        } catch (err) {
          console.warn("⚠️ Basket cleanup failed:", err.message);
        }

        break;
      }

      case "payment_intent.succeeded":
        console.log("💰 Payment intent succeeded");
        break;

      case "payment_intent.payment_failed":
        console.log("⚠️ Payment failed");
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 Webhook handler error:", err);
    return NextResponse.json(
      { error: `Webhook handler error: ${err.message}` },
      { status: 500 }
    );
  }
}
