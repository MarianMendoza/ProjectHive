// pages/api/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../lib/mongoose'; // Adjust the path as necessary
import User from '../../models/User'; // Adjust the path as necessary
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'your-default-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectMongo();

    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        try {
            const decoded: any = jwt.verify(token, SECRET_KEY);
            const userId = decoded.id;

            const user = await User.findById(userId).select('name role'); // Fetch only name and role
            if (!user) return res.status(404).json({ message: 'User not found' });

            return res.status(200).json(user);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
