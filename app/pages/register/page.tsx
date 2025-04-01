'use client';
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';

export default function Register(){
    const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value); // Update confirm password state
  };

  // Handle form submission with correct typing
  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!name || !email || !password){
      setError("All fields are necessary.");
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return; 
    }

    try {
      const res = await fetch('/api/users',{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name, email,password, role
        }),
      });

      if (res?.ok){
        setError("");
        const data = await res.json();
        localStorage.setItem('token', data.token);  
        const form = e.target as HTMLFormElement;
        form.reset();
        router.push('/pages/register2')
      }else{
        const data = await res.json();
        setError(data.message || "User registration Failed")
      }
    } catch (error) {
      console.log("Error during registration: ", error);
      setError("An error occurred, please try again.")
      
    }
  };
    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create An Account
          </h2>
        </div>
  
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" onSubmit={handleSubmit} method="POST" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Name
              </label>
              <div className="mt-2">
                <input
                  onChange = {handleNameChange}
                  id="name"
                  name="name"
                  type="name"
                  autoComplete="name"
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  onChange = {handleEmailChange}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
  
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  onChange = {handlePasswordChange}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
  
  
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-gray-900">
                  Confirm Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  onChange = {handleConfirmPasswordChange}
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="confirm-password"
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
  
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  aria-describedby="terms"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-800 dark:border-gray-700 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                  required
                >
                </input>
                <div className="ml-3 text-sm">
                  <label className="font-light text-black">I accept the
                    <a className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#"> Terms and Conditions</a>
                  </label>
                </div>
  
              </div>
  
  
            </div>
  
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Sign Up
              </button>
              {error && (
                <div className="bg-red-600 text-white w-fit text-sm py-1 rounded-md px-2 mt-2">
                  {error} 
                </div>
              )
              }
  
            </div>
          </form>
  
  
          <p className="mt-10 text-center text-sm text-gray-500">
            Already Have An Account?{''}
            <a href="/pages/sign-in" className="font-semibold leading-6 text-emerald-600 hover:text-emerald-500">
              Login Here
            </a>
          </p>
        </div>
      </div>);
}