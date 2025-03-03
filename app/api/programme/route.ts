import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb'; 
import { Programme, IProgramme } from '@/app/models/Programmes';


// Add Programme
export async function POST(req: Request){
    try {
        const { name } : {name: string} = await req.json();
        await connectMongo();

        const existingProgramme = await Programme.findOne({name});
        if (existingProgramme){
            return NextResponse.json({message: "Programme already exists!"}, {status: 400});
        }

        const newProgramme: IProgramme= new Programme(
        {
            name
        }
        )

        await newProgramme.save();
        return NextResponse.json({message: "New Programme Saved!"}, {status: 201})

        
    } catch (error) {
        console.error("Error occurred:", error); 
        return NextResponse.json({ message: "Error Occurred" }, { status: 500 });
    }
}

// Fetch Programmes
export async function GET(req:Request){
    await connectMongo();
    try {
        const Programmes = await Programme.find();
        return NextResponse.json(Programmes,{status: 200})
    }catch(error){
        console.error("Error fetching Programmes:", error);
        return NextResponse.json({ message: "Error fetching Programmes" }, { status: 400 });
    }
}
