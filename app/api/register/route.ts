import { NextResponse } from "next/server";
import connectMongo from "../../../lib/mongodb"; // Adjust the path according to your structure
import User, { IUser } from "../../models/User"; // Adjust the path according to your structure
import bcrypt from "bcryptjs"; // For password hashing
import { signToken } from '../../../lib/tokenUtils'; // Import the JWT utility


export async function POST(req: Request){
    try {
        const{name, email, password}: {name:string; email: string; password:string} = await req.json();
        await connectMongo();

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return NextResponse.json({ message: "User already exists!" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the new user
        const newUser: IUser = new User({
            imageUrl,
            name,
            email,
            course,
            description,
            password: hashedPassword,
            role: "student", // Automatically assign role as student
            approved: true, // Automatically approve students
        });

        // Save the user to the database
        await newUser.save();
        const token = signToken(newUser._id.toString());
        console.log(token)

        return NextResponse.json({ token, message: "User registered successfully!" }, { status: 201 });
    } catch (error) {
        console.error("Error occurred:", error); // Log the error for debugging
        return NextResponse.json({ message: "Error Occurred" }, { status: 500 });
    }
}