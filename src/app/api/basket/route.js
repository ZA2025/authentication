import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Basket from "@/model/basket";
import connectToDatabase from "@/lib/mongodb";

// GET: return items for authenticated user
export async function GET() {
  try {
    await connectToDatabase();
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const items = await Basket.find({ userId: session.user.id }).sort({ updatedAt: -1 });
    return NextResponse.json(items || []);
  } catch (error) {
    console.error("Error fetching basket:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: upsert by (userId + productId) using a product snapshot
// Body: { product: { id, name, price, imageUrl?, slug? }, quantity }
export async function POST(req) {
  try {
    await connectToDatabase();
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { product, quantity = 1 } = body || {};

    if (!product?.id) return new NextResponse("product.id is required", { status: 400 });
    if (typeof product?.name !== "string" || typeof product?.price !== "number") {
      return new NextResponse("product.name(string) and product.price(number) are required", { status: 400 });
    }

    const selector = { userId: session.user.id, productId: product.id };
    const update = {
      $setOnInsert: {
        userId: session.user.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || "",
        slug: product.slug || "",
      },
      $inc: { quantity: Number(quantity) || 1 },
    };
    const options = { upsert: true, new: true };

    const saved = await Basket.findOneAndUpdate(selector, update, options);
    return NextResponse.json(saved);
  } catch (error) {
    console.error("Error adding to basket:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: decrease quantity or remove item (by userId + productId)
export async function DELETE(req) {
  await connectToDatabase();
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { productId } = await req.json();
  if (!productId) return new NextResponse("productId is required", { status: 400 });

  try {

    const item = await Basket.findOne({ userId: session.user.id, productId });
    if (!item) return new NextResponse("Item not found", { status: 404 });

    if (item.quantity > 1) {
      item.quantity -= 1;
      await item.save();
      return NextResponse.json({ message: "Quantity decreased", quantity: item.quantity });
    } else {
      await Basket.deleteOne({ _id: item._id });
      return NextResponse.json({ message: "Item removed from basket" });
    }
  } catch (error) {
    console.error("Error removing from basket:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}