import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Product from "@/model/product";

export async function GET(req, { params }) {
    try {
        
        await connectToDatabase();
        
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return new NextResponse("Invalid product ID", { status: 400 });
        }

        const product = await Product.findById(id);

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }
    
        return NextResponse.json(product);


    } catch (error) {
        console.error("Error fetching product:", error);
        return new NextResponse("Internal Server Error", {
            status: 500,
        })
    }
    
}