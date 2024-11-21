// /app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server';
import connectMongo from '../../../../lib/mongodb'; // Adjust the path based on your project structure
import Projects from '../../../models/Projects';  // Ensure you import your Project model


export async function GET(req: Request) {
    await connectMongo();

    // Extract the project ID from the URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    try {
        // Fetch the project by ID
        const project = await Projects.findById(id);

        if (!project) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ project }, { status: 200 });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json({ message: 'Error fetching project' }, { status: 500 });
    }
}
// DELETE: Delete a project by ID
export async function DELETE(req: Request) {
    await connectMongo();

    // Get the project ID from the URL parameters
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop();

    try {
        // Attempt to delete the project by ID
        const deletedProject = await Projects.findByIdAndDelete(id);

        if (!deletedProject) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json({ message: 'Error deleting project' }, { status: 500 });
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

  