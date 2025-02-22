"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

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
    if (session) {
      fetchProfileImage();
    }
  }, [session]);

  const userName = session?.user?.name || "";

  return (
    <div>
      <nav className="bg-white border-gray-200">
        <div className="w-full flex items-center justify-between mx-0 p-6">
          <a
            href="https://findlogovector.com/university-college-cork-ucc-logo-vector-svg/"
            target="_blank"
          >
            <img
              src="https://findlogovector.com/wp-content/uploads/2019/04/university-college-cork-ucc-logo-vector.png"
              className="h-16   m-0 p-0"
              alt="UCC Logo"
            />
          </a>

          {/* <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button> */}
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <div className="font-medium items-center mr-20 flex flex-col p-4 md:p-0 mt-4 border md:flex-row md:space-x-12 rtl:space-x-reverse md:mt-0 md:border-0 ">
              <Link
                href="/"
                className="block py-2 px-3 text-black md:p-0 hover:text-lime-600"
                aria-current="page"
              >
                Home
              </Link>
              <Link
                href="/pages/projects"
                className="block py-2 px-3 text-black md:p-0 hover:text-lime-600"
                aria-current="page"
              >
                Projects
              </Link>
              <Link
                href="/pages/past-projects"
                className="block py-2 px-3 text-black md:p-0 hover:text-lime-600"
                aria-current="page"
              >
                Past Projects
              </Link>
              <Link
                href="/pages/users"
                className="block py-2 px-3 text-black md:p-0 hover:text-lime-600"
              >
                {" "}
                Users
              </Link>

              {session ? (
                <>
                  <Link
                    href="/pages/dashboard"
                    className="block py-2 px-3 text-black md:p-0 hover:text-lime-600"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative flex items-center"
                  >
                    <Bell size={24} className="text-gray-700" />
                    {/* Notification Indicator */}
                    <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </button>

                  <div className="relative flex items-center">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex w-11 h-11 items-center space-x-2"
                    >
                      <img
                        src={profileImage || "/placeholder-profile.png"}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full shadow-md "
                      />
                    </button>

                 

                    {menuOpen && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <Link
                            href="/pages/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            View Profile
                          </Link>
                          <Link
                            href="/pages/dashboard"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            <LogOut size={16} className="mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}

                    {notificationOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <p className="px-4 py-2 text-gray-700">
                            No new notifications
                          </p>
                          {/* Add more notifications here if necessary */}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/pages/sign-in"
                    className="block py-2 px-3 text-black md:p-0 rounded md:border-0 hover:text-lime-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/pages/register"
                    className="block py-2 px-3 text-black md:p-0 rounded md:border-0 hover:text-lime-600"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
