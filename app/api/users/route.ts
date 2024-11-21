import { NextResponse } from 'next/server';
import connectMongo from '../../../lib/mongodb'; // Adjust the path based on your project structure
import User from '../../models/User'; // Adjust the path based on your project structure

// POST: Create a new user
export async function POST(req: Request) {
    await connectMongo();

    const { imageUrl, name, email, course, description, password, role, approved } = await req.json();

    try {
        const newUser = new User({
            imageUrl,
            name,
            email,
            course,
            description,
            password,
            role,
            approved,
        });

        await newUser.save();

        return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ message: 'Error creating user' }, { status: 400 });
    }
}

// GET: Fetch all users
export async function GET(req: Request) {
    await connectMongo();

    try {
        const users = await User.find();

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ message: 'Error fetching users' }, { status: 400 });
    }
}

// GET: Fetch a specific user by ID
export async function GET_BY_ID(req: Request) {
    await connectMongo();

    const id = req.url.split("/").pop() as string; // Assuming the ID is part of the URL path, e.g., /api/users/{id}

    try {
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return NextResponse.json({ message: 'Error fetching user by ID' }, { status: 400 });
    }
}
