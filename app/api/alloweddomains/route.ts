import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb'; 
import { AllowedDomain, IAllowedDomain } from '@/app/models/AllowedDomains';
import { GET } from '../deadlines/route';

export async function POST(req: Request){
    try {
        const { domain } : {domain: string} = await req.json();
        await connectMongo();

        const existingDomain = await AllowedDomain.findOne({domain});
        if (existingDomain){
            return NextResponse.json({message: "Domain already exists!"}, {status: 400});
        }

        const newDomain: IAllowedDomain = new AllowedDomain(
        {
            domain
        }
        )

        await newDomain.save();
        return NextResponse.json({messsage: "New Domain Saved!"}, {status: 201})

        
    } catch (error) {
        console.error("Error occurred:", error); 
        return NextResponse.json({ message: "Error Occurred" }, { status: 500 });
    }
}

// Fetch Domains
export async function GET(req:Request){
    await connectMongo();
    try {
        const domains = await AllowedDomain.find();
        return NextResponse.json({message: "Fetched Domains Successfully"},{status: 200})
    }catch(error){
        console.error("Error fetching domains:", error);
        return NextResponse.json({ message: "Error fetching domains" }, { status: 400 });
    }

}