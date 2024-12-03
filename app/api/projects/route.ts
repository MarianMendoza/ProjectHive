import { NextResponse } from 'next/server';
import connectMongo from '../../../lib/mongodb'; // Adjust the path based on your project structure
import Projects from '../../models/Projects'; // Adjust the path based on your project structure
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
// POST: Create a new project
export async function POST(req: Request) {
    await connectMongo();

    const { title, status, visibility, description, files } = await req.json();

    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
    
        const userId = session.user.id;
        const userRole = session.user.role;
        let supervisorId = null;

        if (!userId){
            return NextResponse.json({message: "Username not found in the session"},{status: 400});
        }

        if(userRole == "Lecturer" ){
            supervisorId = userId;
        } else{
            supervisorId = null;
        }
        const newProject = new Projects({
            title,
            status,
            visibility,
            description,
            files,
            projectAssignedTo: {
                supervisorId,
                secondReaderId: null,
                studentsId: [],
                authorId: userId,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newProject.save();

        return NextResponse.json({ message: 'Project created successfully', project: newProject }, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ message: 'Error creating project' }, { status: 400 });
    }
}

// GET: Fetch all projects
export async function GET(req: Request) {
    await connectMongo();

    try {
        mongoose.set("strictPopulate", false);

        const projects = await Projects.find()
        .populate({
            path: 'projectAssignedTo.supervisorId',
            select: 'name'
        })
        .populate({
            path: 'projectAssignedTo.secondReaderId',
            select: 'name'
        })
        .populate({
            path: 'projectAssignedTo.studentsId',
            select: 'name'
        })
        .populate({
            path: 'projectAssignedTo.authorId',
            select: 'name'
        })
        .populate({
            path: "applicants.studentId",
            select: 'name'
        });
        

        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ message: 'Error fetching projects' }, { status: 400 });
    }
}



