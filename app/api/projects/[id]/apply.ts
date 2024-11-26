import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Projects from "@/app/models/Projects";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST: Handle student application to a project
export async function POST(req: Request) {
    await connectMongo();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Student") {
        return NextResponse.json({ message: "Unauthorized. Only students can apply for projects." }, { status: 403 });
    }
    const { projectId } = await req.json();

    if (!projectId) {
        return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    try {
        const project = await Projects.findById(projectId);

        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        if (project.applicantsId.includes(session.user.id)) {
            return NextResponse.json({ message: "You have already applied for this project." }, { status: 400 });
        }

         project.applicantsId.push(session.user.id);

        await project.save();

        return NextResponse.json({ message: "Application successful", project }, { status: 200 });
    } catch (error) {
        console.error("Error applying for project:", error);
        return NextResponse.json({ message: "Error applying for project" }, { status: 500 });
    }
}