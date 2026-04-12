import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { ProjectRequest } from "@/models/ProjectRequest";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "client") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    
    if (!body.title || !body.description || !body.designersNeeded || !body.duration) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const newRequest = await ProjectRequest.create({
      client: new mongoose.Types.ObjectId(userId),
      title: body.title,
      description: body.description,
      designersNeeded: parseInt(body.designersNeeded),
      duration: body.duration,
      budget: body.budget || "Not Specified",
      status: "pending",
      assignedDesigners: []
    });

    return NextResponse.json({ message: "Project request submitted successfully", request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Project request error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
