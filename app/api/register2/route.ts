import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import User from '@/app/models/User';
import { verifyToken } from '@/lib/tokenUtils';

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
    user.approved = role === 'Lecturer' ? false : true; // Set approved based on role
    await user.save();
  
    return NextResponse.json({ user: {_id: user._id, role: user.role, approved: user.approved} }, { status: 200 });
  }