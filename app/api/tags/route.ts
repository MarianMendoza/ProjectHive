import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb'; 
import { Tag, ITag } from '@/app/models/Tags';


// Add Tag
export async function POST(req: Request){
    try {
        const { name } : {name: string} = await req.json();
        await connectMongo();

        const existingTag = await Tag.findOne({name});
        if (existingTag){
            return NextResponse.json({message: "Tag already exists!"}, {status: 400});
        }

        const newTag: ITag= new Tag(
        {
            name
        }
        )

        await newTag.save();
        return NextResponse.json({message: "New Tag Saved!"}, {status: 201})

        
    } catch (error) {
        console.error("Error occurred:", error); 
        return NextResponse.json({ message: "Error Occurred" }, { status: 500 });
    }
}

// Fetch Tags
export async function GET(req:Request){
    await connectMongo();
    try {
        const tags = await Tag.find();
        return NextResponse.json(tags,{status: 200})
    }catch(error){
        console.error("Error fetching tags:", error);
        return NextResponse.json({ message: "Error fetching tags" }, { status: 400 });
    }
}
