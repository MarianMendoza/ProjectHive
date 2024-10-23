import { NextResponse } from 'next/server';
import connectMongo from "../../lib/mongoose"; // Adjust the path according to your structure
import User from "../../models/User"; // Adjust the path according to your structure
import { verifyToken } from '../../lib/tokenUtils'; // Import the JWT utility


export async function POST(req: Request) {
    await connectMongo();
    const { role } = await req.json();
    const token = req.headers.get('Authorization')?.split(' ')[1]; // Get the token from the Authorization header
    console.log(token)
    if (!token) {
      return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }
  
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token." }, { status: 401 });
    }
  
    const userId = decoded.id; // Get the user's ID from the token
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
  
    user.role = role; // Set the user's role
    user.approved = role === 'lecturer' ? false : true; // Set approved based on role
    await user.save();
  
    return NextResponse.json({ message: "Role saved successfully!" }, { status: 200 });
  }