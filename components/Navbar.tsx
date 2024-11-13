'use client'
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";



export default function Navbar() {
  const {data: session} = useSession();
  return (
    <div>
      <nav className="bg-white border-gray-200 shadow-md">
        <div className="w-full flex items-center justify-between mx-0 p-6">

          <a href="https://findlogovector.com/university-college-cork-ucc-logo-vector-svg/" target="_blank">
            <img src="https://findlogovector.com/wp-content/uploads/2019/04/university-college-cork-ucc-logo-vector.png" className="h-16   m-0 p-0" alt="UCC Logo" />
          </a>

          {/* <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button> */}
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border md:flex-row md:space-x-12 rtl:space-x-reverse md:mt-0 md:border-0 ">
              <Link href = "/pages/home" className="block py-2 px-3 text-black md:p-0 hover:text-lime-600" aria-current="page">Home</Link>
              <Link href = "/pages/projects" className="block py-2 px-3 text-black md:p-0 hover:text-lime-600" aria-current="page">Projects</Link>
              <Link href = "/pages/past-projects" className="block py-2 px-3 text-black md:p-0 hover:text-lime-600" aria-current="page">Past Projects</Link>
              {session ?(
                <>
                  <Link href="/pages/dashboard" className="block py-2 px-3 text-black md:p-0 hover:text-lime-600">Dashboard</Link>
                  <Link href="/pages/profile" className="block py-2 px-3 text-black md:p-0 hover:text-lime-600">Profile</Link>
                  <button onClick={() => signOut({ callbackUrl:"/pages/home"})} className="block py-2 px-3 text-black md:p-0 rounded md:border-0 hover:text-lime-600">Logout</button>
                </>
              ) :
              (
                <>
                <Link href = "/pages/sign-in" className="block py-2 px-3 text-black md:p-0 rounded md:border-0 hover:text-lime-600">Login</Link>
                <Link href = "/pages/register" className="block py-2 px-3 text-black md:p-0 rounded md:border-0 hover:text-lime-600">Register</Link>
                </>
              )
              }
            
            </ul>
          </div>
        </div>
      </nav>

    </div>
  );
}