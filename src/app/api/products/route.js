import connectToDatabase from "@/lib/mongodb";
import { auth } from "@/auth";
import Product from "@/model/product";
import { NextResponse } from "next/server";
// GET all products
export async function GET() {
    try {
        await connectToDatabase();
        const products = await Product.find();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Post create a new product (only admin)
export async function POST(req) {
    const session = await auth();
    
    if (!session?.user) {
        return new NextResponse("You are not authenticated!", { status: 401 });
    }

    if (session.user.role !== "admin") {
        return new NextResponse("You are not authorized!", { status: 403 });
    }

    const body = await req.json();

    try {
        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}

