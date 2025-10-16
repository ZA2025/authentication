import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Favorite from "@/model/favorite";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req) {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user) {
        return new NextResponse(`You are not authenticated!`, {
            status: 401,
        });
    }

    const { productId } = await req.json();
    if (!productId) return new NextResponse("productId is required", { status: 400 });

    const existing = await Favorite.findOne({
        userId: session.user.id,
        productId,
      });
    
      if (existing) {
        return new NextResponse("Already in favorites", { status: 400 });
      }
      const favorite = new Favorite({
        userId: session.user.id,
        productId,
      });

      await favorite.save();
      return NextResponse.json(favorite, { status: 201 });
}

export async function GET() {
    const session = await auth();

    if (!session?.user) {
        return new NextResponse(`You are not authenticated!`, {
            status: 401,
        })
    }
    const favorites = await Favorite.find({ userId: session.user.id }).populate("productId");
    return NextResponse.json(favorites);
}

export async function DELETE(req) {
    const session = await auth();

    if (!session?.user) {
        return new NextResponse(`You are not authenticated!`, {
            status: 401,
        })
    }

    const { productId } = await req.json();

    const deleted = await Favorite.findOneAndDelete({
        userId: session.user.id,
        productId,
    })

    if (!deleted) {
        return new NextResponse("Favorite not found", { status: 404 });
    }

    return NextResponse.json({ message: "Removed from favorites" });
    
}