import connectToDatabase from "@/lib/mongodb";
import { auth } from "@/auth";
import UserInfo from "@/model/userInfo-model";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse(`You are not authenticated!`, { status: 401 });
  }

  const userId = session.user.id;

  await connectToDatabase();

  try {
    const {
      name,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      postcode,
      country,
    } = await req.json();

    // Either create new or update existing user info
    const updatedInfo = await UserInfo.findOneAndUpdate(
      { userId },
      { name, email, phone, addressLine1, addressLine2, city, postcode, country },
      { new: true, upsert: true } // upsert = create if not exists
    );

    return NextResponse.json(updatedInfo, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function GET(req) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse(`You are not authenticated!`, { status: 401 });
  }

  const userId = session.user.id;

  await connectToDatabase();

  try {
    const userInfo = await UserInfo.findOne({ userId });
    return NextResponse.json(userInfo, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function PUT(req) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse(`You are not authenticated!`, { status: 401 });
  }

  const userId = session.user.id;

  await connectToDatabase();

  try {
    const {
      name,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      postcode,
      country,
    } = await req.json();

    const updatedUserInfo = await UserInfo.findOneAndUpdate(
      { userId },
      { name, email, phone, addressLine1, addressLine2, city, postcode, country },
      { new: true }
    );

    return NextResponse.json(updatedUserInfo, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(error.message, { status: 500 });
  }
}
