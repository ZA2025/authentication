import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Favorite from "@/model/favorite";
import connectToDatabase from "@/lib/mongodb";
import { client } from "@/lib/sanity";

export async function POST(req) {
  await connectToDatabase();
  const session = await auth();
  if (!session?.user) return new NextResponse("You are not authenticated!", { status: 401 });

  const body = await req.json();
  const { product } = body || {};
  const productId = String(product?.id || "");

  if (!productId) return new NextResponse("product.id is required", { status: 400 });

  const selector = { userId: String(session.user.id), productId };
  const update = {
    $setOnInsert: {
      userId: String(session.user.id),
      productId,
      name: String(product?.name || ""),
      imageUrl: product?.imageUrl || product?.image?.asset?.url || "",
      slug: typeof product?.slug === "string" ? product.slug : (product?.slug?.current || ""),
    },
  };

  try {
    const existing = await Favorite.findOne(selector);
    if (existing) return new NextResponse("Already in favorites", { status: 400 });

    const saved = await Favorite.findOneAndUpdate(selector, update, { upsert: true, new: true });
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error("Favorite POST error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  await connectToDatabase();
  const session = await auth();
  if (!session?.user) return new NextResponse("You are not authenticated!", { status: 401 });

  try {
    const favorites = await Favorite.find({ userId: String(session.user.id) }).sort({ updatedAt: -1 });
    
    // Enrich favorites with full product details from Sanity
    const enrichedFavorites = await Promise.all(
      favorites.map(async (favorite) => {
        try {
          const productQuery = `*[_type == "product" && _id == $productId][0]{
            _id,
            name,
            slug,
            price,
            details,
            description,
            category,
            stock,
            featured,
            "image": image.asset->_id,
          }`;
          
          const product = await client.fetch(productQuery, { productId: favorite.productId });
          
          if (product) {
            // Return enriched favorite with full product details
            return {
              ...favorite.toObject(),
              _id: product._id,
              name: product.name,
              price: product.price,
              details: product.details,
              description: product.description,
              category: product.category,
              stock: product.stock,
              featured: product.featured,
              slug: product.slug,
              image: product.image,
            };
          }
          
          // If product not found in Sanity, return favorite with stored data
          return favorite.toObject();
        } catch (err) {
          console.error(`Error fetching product ${favorite.productId}:`, err);
          return favorite.toObject();
        }
      })
    );
    
    return NextResponse.json(enrichedFavorites || []);
  } catch (err) {
    console.error("Favorite GET error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req) {
  await connectToDatabase();
  const session = await auth();
  if (!session?.user) return new NextResponse("You are not authenticated!", { status: 401 });

  const { productId } = await req.json();
  if (!productId) return new NextResponse("productId is required", { status: 400 });

  try {
    const deleted = await Favorite.findOneAndDelete({
      userId: String(session.user.id),
      productId: String(productId),
    });
    if (!deleted) return new NextResponse("Favorite not found", { status: 404 });
    return NextResponse.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Favorite DELETE error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}