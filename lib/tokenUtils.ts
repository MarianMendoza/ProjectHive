import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'your-default-secret'; // Fallback for local development


// Function to sign the token
export const signToken = (userId: string) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
};

// Function to verify the token
export const verifyToken = (token: string): { id: string } | null => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Ensure the decoded token is of the expected shape
        if (typeof decoded === 'object' && 'id' in decoded) {
            return decoded as { id: string }; // Explicitly cast to expected shape
        }
        return null; // If the decoded token is not valid, return null
    } catch (error) {
        console.error("Token verification failed:", error);
        return null; // Return null if verification fails
    }
};
