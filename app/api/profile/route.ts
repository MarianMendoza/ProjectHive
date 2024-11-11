import { NextResponse } from 'next/server';
import connectMongo from '../../../lib/mongodb'; // Adjust the path according to your structure
import User from '../../models/User'; // Adjust the path according to your structure
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'your-default-secret';

export async function GET(req: Request) {
    await connectMongo();

    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const decoded: any = jwt.verify(token, SECRET_KEY);
        const userId = decoded.id;

        const user = await User.findById(userId).select('name role'); // Fetch only name and role
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Token verification error:", error);
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
}
