import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Basket from "@/model/basket";
import connectToDatabase from "@/lib/mongodb";
import { client } from "@/lib/sanity";

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

// POST: upsert by (userId + productId + size) using a product snapshot
// Body: { product: { id, name, price, imageUrl?, slug?, size? }, quantity }
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

    const size = product.size || 'medium';
    if (!['small', 'medium', 'large'].includes(size)) {
      return new NextResponse("product.size must be 'small', 'medium', or 'large'", { status: 400 });
    }

    // Check stock availability
    try {
      const productQuery = `*[_type == "product" && _id == $productId][0]{
        sizesStock,
        stock
      }`;
      const productData = await client.fetch(productQuery, { productId: product.id });
      
      if (productData) {
        // Get stock for the selected size
        const availableStock = productData.sizesStock?.[size] ?? productData.stock ?? 0;
        
        // Get current quantity in basket for this product + size
        const existingItem = await Basket.findOne({ 
          userId: session.user.id, 
          productId: product.id, 
          size 
        });
        const currentBasketQuantity = existingItem?.quantity || 0;
        const requestedQuantity = Number(quantity) || 1;
        const newTotalQuantity = currentBasketQuantity + requestedQuantity;
        
        // Check if adding this quantity would exceed available stock
        if (newTotalQuantity > availableStock) {
          return new NextResponse(
            JSON.stringify({ 
              error: `Only ${availableStock} ${availableStock === 1 ? 'item' : 'items'} available in ${size} size. You already have ${currentBasketQuantity} in your basket.`,
              availableStock,
              currentBasketQuantity
            }), 
            { status: 400 }
          );
        }
      }
    } catch (stockError) {
      console.error("Error checking stock:", stockError);
      // Continue if stock check fails (don't block the operation, but log the error)
    }

    const selector = { userId: session.user.id, productId: product.id, size };
    const update = {
      $setOnInsert: {
        userId: session.user.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || "",
        slug: product.slug || "",
        size,
      },
      $inc: { quantity: Number(quantity) || 1 },
    };
    const options = { upsert: true, new: true };

    try {
      const saved = await Basket.findOneAndUpdate(selector, update, options);
      return NextResponse.json(saved);
    } catch (dbError) {
      // Handle duplicate key error from old index
      if (dbError.code === 11000 && dbError.keyPattern && !dbError.keyPattern.size) {
        console.log("Detected old index, attempting migration...");
        try {
          const collection = Basket.collection;
          // Drop old index
          try {
            await collection.dropIndex('userId_1_productId_1');
          } catch (idxError) {
            // Index might not exist, that's okay
            if (idxError.code !== 27) throw idxError;
          }
          
          // Ensure all items have size
          await collection.updateMany(
            { size: { $exists: false } },
            { $set: { size: 'medium' } }
          );
          
          // Create new index
          await collection.createIndex({ userId: 1, productId: 1, size: 1 }, { unique: true });
          
          // Retry the operation
          const saved = await Basket.findOneAndUpdate(selector, update, options);
          return NextResponse.json(saved);
        } catch (migrationError) {
          console.error("Migration failed:", migrationError);
          return new NextResponse("Database migration needed. Please contact support.", { status: 500 });
        }
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error adding to basket:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: decrease quantity or remove item (by userId + productId + size)
export async function DELETE(req) {
  await connectToDatabase();
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { productId, size } = await req.json();
  if (!productId) return new NextResponse("productId is required", { status: 400 });

  try {
    const selector = { userId: session.user.id, productId };
    if (size) {
      selector.size = size;
    }
    
    const item = await Basket.findOne(selector);
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