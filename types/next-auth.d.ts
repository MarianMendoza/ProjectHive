// next-auth.d.ts
import NextAuth from 'next-auth';
import { IUser } from './models/User'; // Import your IUser interface

declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Custom field to store the user ID
      imageUrl: string;
      course: string;
      description: string;
      name: string;
      email: string;
      role: 'Student' | 'Lecturer' | 'Admin'; // Custom role field
      approved: boolean; // Custom approved field
    };
  }

  interface User extends IUser {
    id: string;
    role: 'Student' | 'Lecturer' | 'Admin';
    approved: boolean;
  }
}
