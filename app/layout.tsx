// components/RootLayout.tsx
import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google"
import './globals.css'
import { Provider } from  "./provider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        <Navbar />
        <Provider>
        <main className="flex-grow">
          {children}
        </main>
        </Provider>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
