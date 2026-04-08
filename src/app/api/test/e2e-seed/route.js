import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Basket from "@/model/basket";
import User from "@/model/user-model";

function isEnabled() {
  return process.env.NODE_ENV !== "production";
}

export async function POST(req) {
  if (!isEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email || "e2e.user@example.com";
    const password = body?.password || process.env.E2E_TEST_PASSWORD;
    const name = body?.name || "E2E User";

    if (!password) {
      return NextResponse.json(
        { error: "E2E seed requires a password in body or E2E_TEST_PASSWORD env." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          email,
          password: hashedPassword,
          authType: "local",
          emailVerified: true,
          role: "user",
        },
        $unset: {
          emailVerificationToken: 1,
          emailVerificationExpiry: 1,
          resetToken: 1,
          resetTokenExpiry: 1,
        },
      },
      { upsert: true, new: true }
    );

    await Basket.findOneAndUpdate(
      { userId: String(user._id), productId: "e2e-product-1", size: "medium" },
      {
        $set: {
          name: "E2E Cookie Box",
          price: 12.5,
          imageUrl: "/images/fallback.png",
          slug: "e2e-cookie-box",
        },
        $setOnInsert: { quantity: 1 },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      ok: true,
      email,
      password,
      userId: String(user._id),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to seed e2e data" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  if (!isEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email || "e2e.user@example.com";

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (user) {
      await Basket.deleteMany({ userId: String(user._id) });
      await User.deleteOne({ _id: user._id });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to clean e2e data" },
      { status: 500 }
    );
  }
}
