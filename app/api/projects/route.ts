import { NextResponse } from 'next/server';
import connectMongo from '../../../lib/mongodb'; // Adjust the path based on your project structure
import Projects from '../../models/Projects'; // Adjust the path based on your project structure

// POST: Create a new project
export async function POST(req: Request) {
    await connectMongo();

    const { title, status, visibility, description, files } = await req.json();

    try {
        const newProject = new Projects({
            title,
            status,
            visibility,
            description,
            files,
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
        const projects = await Projects.find();

        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ message: 'Error fetching projects' }, { status: 400 });
    }
}

// GET: Fetch a specific project by ID
export async function GET_BY_ID(req: Request) {
    await connectMongo();

    const id  = req.url.split("/").pop() as string; // Assuming the ID is part of the URL path, e.g., /api/projects/{id}

    try {
        const project = await Projects.findById(id);
        if (!project) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        return NextResponse.json({ message: 'Error fetching project by ID' }, { status: 400 });
    }
}

// PUT: Update a project by ID
export async function PUT(req: Request) {
    await connectMongo();

    const  id  = req.url.split("/").pop() as string; // Assuming the ID is part of the URL path, e.g., /api/projects/{id}
    const { title, status, visibility, description, files } = await req.json();

    try {
        const updatedProject = await Projects.findByIdAndUpdate(
            id,
            { title, status, visibility, description, files, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Project updated successfully', project: updatedProject }, { status: 200 });
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json({ message: 'Error updating project' }, { status: 400 });
    }
}

