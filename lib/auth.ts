import connectMongo from "./mongodb"; // Adjust the path according to your structure
import User from "@/app/models/User";
import type { NextAuthOptions } from "next-auth";
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectMongo();

        const { email, password } = credentials as { email: string; password: string };

        const user = await User.findOne({ email });
        if (!user) throw new Error("Invalid email or password.");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid email or password.");

        return {
          id: user._id.toString(),
          imageUrl: user.imageUrl,
          email: user.email,
          course: user.course,
          description: user.description,
          assigned: user.assigned,
          name: user.name,
          role: user.role,
          approved: user.approved,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.assigned = user.assigned;
        token.approved = user.approved;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'Student' | 'Lecturer' | 'Admin';
        session.user.approved = token.approved as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", 
  },
  events: {
    signIn: async () => {},
    signOut: async () => {},
    session: async () => {},
  },
  pages: {
    signIn: "/pages/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
  broadcastChannel: null,

};

export default NextAuth(authOptions);
