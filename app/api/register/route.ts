import { NextResponse } from "next/server";

export async function POST(req: Request){
    try {
        const{name, email, password}: {name:string; email: string; password:string} = await req.json();
        console.log(name);
        console.log(email);
        console.log(password);
        return NextResponse.json({message:"User Registered"},{status:201})


    } catch (error) {
        return NextResponse.json({message:"Error Occurred"},{status:500})

        
    }
}