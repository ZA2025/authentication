import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Product from "@/model/product";
import Basket from "@/model/basket";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const basket = await Basket.find({ userId: session.user.id }).populate("productId"); 
    return NextResponse.json(basket);

  } catch (error) {
      console.error("Error fetching basket:", error);
  return new NextResponse("Internal Server Error", { status: 500 });

  }
}

export async function POST(req) {

  try {
    await connectToDatabase();
    const session = await auth();
    if (!session?.user) {
        return new NextResponse('You are not authenticated', {
            status: 401,
        });
    }

    const { productId, quantity = 1 } = await req.json();
    const product = await Product.findById(productId);

    if (!productId) return new NextResponse("productId is required", { status: 400 });
    
    // Check if already in basket
    let basketItem = await Basket.findOne({
        userId: session.user.id,
        productId,
    });

    if (basketItem) {
        basketItem.quantity += quantity;
        await basketItem.save();
    } else {
        basketItem = await Basket.create({
            userId: session.user.id,
            productId,
            quantity,
        })
    }

    // Return the basket item with populated product to ensure client has full details immediately
    const populated = await Basket.findById(basketItem._id).populate("productId");
    return NextResponse.json(populated);

  } catch (error) {
      console.error("Error adding to basket:", error);
      return new NextResponse("Internal Server Error", { status: 500 });

  }

}
 
// DELETE endpoint: decrease quantity or remove item
export async function DELETE(req) {

    try {
      await connectToDatabase();
      const session = await auth();
      if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const { productId } = await req.json();
  
      if (!productId) {
        return new NextResponse("productId is required", { status: 400 });
      }
  
      // Find basket item
      const basketItem = await Basket.findOne({
        userId: session.user.id,
        productId,
      });
  
      if (!basketItem) {
        return new NextResponse("Item not found", { status: 404 });
      }
  
      if (basketItem.quantity > 1) {
        basketItem.quantity -= 1;
        await basketItem.save();
        return NextResponse.json({
          message: "Quantity decreased",
          quantity: basketItem.quantity,
        });
      } else {
        await Basket.deleteOne({ _id: basketItem._id });
        return NextResponse.json({
          message: "Item removed from basket",
        });
      }
    } catch (error) {
      console.error("Error removing from basket:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
}