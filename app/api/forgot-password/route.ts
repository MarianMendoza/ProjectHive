import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "@/lib/tokenUtils"; // Custom utils to sign/verify JWT
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(req: Request) {
  const startTime = Date.now(); // Start time to measure total execution time

  try {
    console.log("Received forgot password request...");
    
    const { email }: { email: string } = await req.json();
    console.log(`Received email: ${email}`);

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectMongo();
    console.log("MongoDB connection established.");

    // Find the user by email
    console.log("Searching for user in MongoDB...");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found.");
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }
    console.log("User found.");

    // Generate a reset token (expires in 1 hour)
    console.log("Generating reset token...");
    const resetToken = signToken(user._id.toString(), "1h"); 
    console.log(`Generated reset token: ${resetToken}`);

    // Create the reset password link
    const resetLink = `${process.env.APP_URL}/pages/reset-password?token=${resetToken}`;
    console.log(`Reset password link created: ${resetLink}`);

    // Send the reset link via email (using SendGrid)
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL as string,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
      html: `<strong>Click the link to reset your password: <a href="${resetLink}">Reset Password</a></strong>`,
    };

    console.log("Sending reset email via SendGrid...");
    await sgMail.send(msg);
    console.log("Password reset email sent.");

    const endTime = Date.now();
    console.log(`Request processed in ${endTime - startTime}ms`);

    return NextResponse.json({ message: "Password reset link sent!" }, { status: 200 });
  } catch (error) {
    console.error("Error in forgot password API:", error);
    return NextResponse.json({ message: "Error occurred" }, { status: 500 });
  }
}
