import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "@/lib/tokenUtils";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(req: Request) {
  const startTime = Date.now();

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
      subject: " Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h2 style="color: #047857; margin-bottom: 20px;">🔐 Reset Your Password</h2>
            <p style="font-size: 16px; color: #333;">
              We received a request to reset your password. Click the button below to proceed.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #047857; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;" />
            <p style="font-size: 12px; color: #999; text-align: center;">
              This link will expire in 1 hour.<br />
              &copy; ${new Date().getFullYear()} Project Hive. All rights reserved.
            </p>
          </div>
        </div>
      `,
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
