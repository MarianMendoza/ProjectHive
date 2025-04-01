"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, X } from "lucide-react";
import Notifications from "./Notifications";

export default function Navbar() {
  const { data: session } = useSession();
  const [logo, setLogo] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchProfileImage = async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (!response.ok) throw new Error("Failed to fetch profile image");

        const data = await response.json();

        if (data.user.pfpurl) {
          setProfileImage(data.user.pfpurl);
        } else {
          console.log("No profile image URL found");
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    }
  };

  useEffect(() => {
    const storedLogo = localStorage.getItem("logo");
    setLogo(storedLogo);
  }, []);

  useEffect(() => {
    if (session) {
      fetchProfileImage();
    }
  }, [session]);

  const userName = session?.user?.name || "";

  return (
    <nav className="bg-white border-gray-200">
      <div className="w-full flex items-center justify-between p-6">
        <a
          href="https://findlogovector.com/university-college-cork-ucc-logo-vector-svg/"
          target="_blank"
          className="flex-shrink-0"
        >
          <img
            src={
              logo
               ||
              "https://findlogovector.com/wp-content/uploads/2019/04/university-college-cork-ucc-logo-vector.png"
            }
            className="h-16"
            alt="Logo"
          />
        </a>

        {/* MOBILE: Menu Button (Only visible on sm and below) */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition"
        >
          {dropdownOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* MOBILE: Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-20 left-0 w-full bg-white mt-2 p-4 border-b-2 space-y-2 md:hidden z-50">
            <Link
              href="/"
              className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded"
            >
              Home
            </Link>
            <Link
              href="/pages/projects"
              className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded"
            >
              Projects
            </Link>
            <Link
              href="/pages/past-projects"
              className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded"
            >
              Past Projects
            </Link>
            <Link
              href="/pages/users"
              className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded"
            >
              Users
            </Link>

            {session ? (
              <>
                <Link
                  href="/pages/dashboard"
                  className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded"
                >
                  Dashboard
                </Link>
                <Link
                  href="/pages/profile"
                  className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 rounded"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/pages/sign-in"
                  className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded"
                >
                  Login
                </Link>
                <Link
                  href="/pages/register"
                  className="block py-2 px-4 text-gray-800 hover:bg-gray-100 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}

        {/* DESKTOP: Navigation Links */}
        <div className="hidden md:flex items-center space-x-12">
          <Link href="/" className="text-black hover:text-emerald-700">
            Home
          </Link>
          
          <Link
            href="/pages/projects"
            className="text-black hover:text-emerald-700"
          >
            Projects
          </Link>
          <Link
            href="/pages/past-projects"
            className="text-black hover:text-emerald-700"
          >
            Past Projects
          </Link>
          <Link href="/pages/users" className="text-black hover:text-emerald-700">
            Users
          </Link>

          {session ? (
            <Link
              href="/pages/dashboard"
              className="text-black hover:text-emerald-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/pages/register"
                className="text-black hover:text-emerald-700"
              >
                Register
              </Link>
              <Link
                href="/pages/sign-in"
                className="text-black hover:text-emerald-700"
              >
                Login
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Profile & Notifications (Always Visible) */}
          {session && (
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative flex items-center"
            >
              <Bell
                size={24}
                className="text-gray-700 hover:text-gray-900 transition"
              />
              <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>
          )}

          {/* Profile Dropdown */}
          {session && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-11 h-11 flex items-center rounded-full border border-gray-300 overflow-hidden"
              >
                <img
                  src={profileImage || "/placeholder-profile.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Profile Dropdown Content */}
              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      href="/pages/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      View Profile
                    </Link>
                    <Link
                      href="/pages/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {notificationOpen && (
            <div className="absolute top-20 right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 w-auto">
              <div className="py-1">
                <Notifications />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
