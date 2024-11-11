// components/RootLayout.tsx
import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google"
import './globals.css'
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Provider } from "./provider";

const libre = Libre_Baskerville( {weight: '400' ,subsets: ["latin"]}) ;

export const metadata: Metadata = {
  title: "Project Hive",
  description: "Final Year Project Management System",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className={libre.className}>
      <body 
        className={`antialiased flex flex-col min-h-screen`}
      >
        <Provider>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
