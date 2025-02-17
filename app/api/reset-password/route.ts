import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb"; 
import User from "@/app/models/User"; 
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/tokenUtils";

export async function POST(req: Request) {
  try {
    const { token, newPassword }: { token: string, newPassword: string } = await req.json();
    await connectMongo();

    // Verify the reset token
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    // Find the user by ID
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user"s password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: "Password reset successful!" }, { status: 200 });
  } catch (error) {
    console.error("Error in reset password API:", error);
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    await connectMongo();

    // Verify the reset token
    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    // Find the user by ID (optional, to ensure user exists)
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Token is valid, ready to reset password" }, { status: 200 });
  } catch (error) {
    console.error("Error in token validation API:", error);
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}