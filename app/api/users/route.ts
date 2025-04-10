import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb'; 
import User, { IUser } from '../../models/User';
import bcrypt from "bcryptjs"; 
import { signToken } from "@/lib/tokenUtils";
import AllowedDomain from '@/app/models/AllowedDomains';

//POST: Create a new user
export async function POST(req: Request){
    try {
        const{name, email, password}: {name:string; email: string; password:string} = await req.json();
        await connectMongo();

        const emailDomain = email.split("@")[1];
        if(!emailDomain){
            return NextResponse.json({ message: "Invalid email format!" }, { status: 400 });
        }

        const domainAllowed = await AllowedDomain.findOne({domain: emailDomain});
        if (!domainAllowed) {
            return NextResponse.json({ message: "Email domain is not allowed!" }, { status: 403 });
          }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return NextResponse.json({ message: "User already exists!" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the new user
        const newUser: IUser = new User({
            name,
            email,
            password: hashedPassword,  
            role: "Student", 
            approved: true, 
        });

        await newUser.save();
        const token = signToken(newUser._id.toString());
        console.log(token)

        return NextResponse.json({ token, message: "User registered successfully!" }, { status: 201 });
    } catch (error) {
        console.error("Error occurred:", error); 
        return NextResponse.json({ message: "Error Occurred" }, { status: 500 });
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
        return NextResponse.json({ message: "Error fetching users" }, { status: 400 });
    }
}

// GET: Fetch a specific user by ID
export async function GET_BY_ID(req: Request) {
    await connectMongo();

    const id  = req.url.split("/").pop() as string; // Assuming the ID is part of the URL path, e.g., /api/projects/{id}

    try {
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: 'user not found' }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return NextResponse.json({ message: 'Error fetching user by ID' }, { status: 400 });
    }
}
