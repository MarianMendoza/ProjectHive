"use client"
import { useEffect } from 'react';
import Home from "@/components/Home";
import { io } from "socket.io-client"

export default function Page() {

  useEffect(() => {
    const socket = io("http://localhost:5000");
    console.log(socket)

  },[])
  return(
    <div>
      <Home/>
    </div>
  )
}


