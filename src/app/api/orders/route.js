import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/model/order";

export async function GET() {
    await connectToDatabase();
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const orders = await Order.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();

    return NextResponse.json({ orders });
}


