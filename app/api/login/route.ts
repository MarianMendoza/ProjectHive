import { NextResponse } from 'next/server';
import connectMongo from '../../lib/mongoose'; // Adjust the path according to your structure
import User from '../../(models)/User'; // Adjust the path according to your structure
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'your-default-secret';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        await connectMongo();

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
        }

        // Create a JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        return NextResponse.json({ token, role: user.role, message: "Login successful!" }, { status: 200 });
    } catch (error) {
        console.error("Error occurred during login:", error);
        return NextResponse.json({ message: "An error occurred during login." }, { status: 500 });
    }
}
