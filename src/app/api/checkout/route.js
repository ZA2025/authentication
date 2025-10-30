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
        const basket = await Basket.find({ userId: session.user.id });

        if (!basket || basket.length === 0) {
            return NextResponse.json({ error: "Basket is empty" }, { status: 400 });
        }

        // Map basket snapshot fields to Stripe line items
        const line_items = basket
            .filter(item => {
                // Validate required fields
                const price = Number(item.price);
                const quantity = Number(item.quantity || 1);
                return price > 0 && quantity > 0 && item.name;
            })
            .map(item => ({
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: String(item.name),
                    },
                    unit_amount: Math.round(Number(item.price) * 100), // in pence
                },
                quantity: Number(item.quantity || 1),
            }));

        if (line_items.length === 0) {
            return NextResponse.json({ error: "No valid items in basket" }, { status: 400 });
        }

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
        return NextResponse.json({ id: stripeSession.id });


    } catch (err) {
        console.log("Stripe checkout error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } 
}