import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "designer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    await connectToDatabase();

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { 
        user: new mongoose.Types.ObjectId(userId),
        ...body 
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Profile updated successfully", profile: updatedProfile }, { status: 200 });
  } catch (error) {
    console.error("Profile update error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
