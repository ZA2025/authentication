import Stripe from 'stripe';
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Basket from "@/model/basket";
import connectToDatabase from "@/lib/mongodb";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const basket = await Basket.find({ userId: session.user.id }).populate("productId");

        if (!basket || basket.length === 0) {
            return new Response("Basket is empty", { status: 400 });
        }

        // Map basket items to Stripe line items
        const line_items = basket.map(item => ({
            price_data: {
            currency: "gbp", // UK Pounds
            product_data: {
                name: item.productId.name,
                description: item.productId.description || "",
            },
            unit_amount: Math.round(item.productId.price * 100), // in pence
            },
            quantity: item.quantity,
        }));

        // Create Stripe checkout session
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
            metadata: {
            userId: session.user.id,
            },
        });
        return new Response(JSON.stringify({ id: stripeSession.id }), { status: 200 });


    } catch (err) {
        console.log("Stripe checkout error:", err);
        return new NextResponse(JSON.stringify({ error: err.message }), { status: 500 });
    } 
}