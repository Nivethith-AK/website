import { NextResponse } from "next/server";
import { User } from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role
    });

    return NextResponse.json({ message: "User registered", user: { id: newUser._id, name, email, role } }, { status: 201 });
  } catch (error) {
    console.error("Registration error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
