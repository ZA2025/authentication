import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Favorite from "@/model/favorite";
import connectToDatabase from "@/lib/mongodb";

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
    return NextResponse.json(favorites || []);
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