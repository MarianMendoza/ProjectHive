import { redirect } from "next/navigation";
import Image from "next/image";
import { SessionProvider } from "next-auth/react";

export default function Page() {
  return(
    <SessionProvider>
      { redirect('/pages/home')}
    </SessionProvider>
  )
}


