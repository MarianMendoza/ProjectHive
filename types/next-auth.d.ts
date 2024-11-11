// next-auth.d.ts
import NextAuth from 'next-auth';
import { IUser } from './models/User'; // Import your IUser interface

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Custom field to store the user ID
      name: string;
      email: string;
      role: 'student' | 'lecturer' | 'admin'; // Custom role field
      approved: boolean; // Custom approved field
    };
  }

  interface User extends IUser {
    id: string;
    role: 'student' | 'lecturer' | 'admin';
    approved: boolean;
  }
}
