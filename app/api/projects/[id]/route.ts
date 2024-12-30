import { NextResponse } from "next/server";
import connectMongo from "../../../../lib/mongodb";
import Projects from "../../../models/Projects";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

// GET: Retrieve a project by ID.
export async function GET(req: Request) {
    await connectMongo();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    try {
        const project = await Projects.findById(id).populate({
            path: "applicants.studentId",
            select: 'name'
        });
        if (!project) {
            throw new Error("Project not found");
        }

        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ project }, { status: 200 });
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json({ message: "Error fetching project" }, { status: 500 });
    }
}


// DELETE: Delete a project by ID
export async function DELETE(req: Request) {
    await connectMongo();

    const url = new URL(req.url)
    const id = url.pathname.split("/").pop();

    try {
        const deletedProject = await Projects.findByIdAndDelete(id);

        if (!deletedProject) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ message: "Error deleting project" }, { status: 500 });
    }
}

//PUT: update project id
export async function PUT(req: Request) {
    await connectMongo();

    const id = req.url.split("/").pop() as string; 
    const { title, status, visibility, description, files, projectAssignedTo, applicants } = await req.json();

    try {
        const assignedStudentsIds = projectAssignedTo?.studentsId || []; // Ensure it matches `studentsId` field

        const normalizedAssignedIds = assignedStudentsIds.map((id: string) => new mongoose.Types.ObjectId(id));

        const updatedApplicants = applicants.map((applicant: any) => {
            const studentId = applicant.studentId._id || applicant.studentId;
            if (normalizedAssignedIds.some((assignedId: mongoose.Types.ObjectId) => assignedId.equals(studentId))) {
                return { ...applicant, applicationStatus: "Assigned" };
            }
            return applicant;
        });

        const updatedProject = await Projects.findByIdAndUpdate(
            id,
            {
                title,
                status,
                visibility,
                description,
                files,
                projectAssignedTo: {
                    ...projectAssignedTo,
                    studentsId: normalizedAssignedIds,
                },
                applicants: updatedApplicants,
                updatedAt: new Date(),
            },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "Project updated successfully", project: updatedProject },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json({ message: "Error updating project" }, { status: 400 });
    }
}




//POST: Add an applicant id into project with the session.user.id
export async function POST(req: Request) {
    await connectMongo();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Student") {
        return NextResponse.json({ message: "Unauthorized. Only students can apply for projects." }, { status: 403 });
    }

    if (!id) {
        return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    try {
        const project = await Projects.findById(id);

        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        const alreadyApplied = project.applicants.some(
            (applicant: { studentId: mongoose.Types.ObjectId; applicationStatus: "Pending" | "Assigned" | "Rejected" }) =>
                applicant.studentId.toString() === session.user.id
        );

        const existingProject = await Projects.findOne({ "projectAssignedTo": session.user.id });

        if (existingProject) {
            return NextResponse.json({ message: "You are already assigned to another project." }, { status: 400 });
        }

        if (alreadyApplied) {
            return NextResponse.json({ message: "You have already applied for this project." }, { status: 400 });
        }

        project.applicants.push({ studentId: session.user.id, applicationStatus: "Pending" });

        await project.save();

        return NextResponse.json({ message: "Application successful", project }, { status: 200 });
    } catch (error) {
        console.error("Error applying for project:", error);
        return NextResponse.json({ message: "Error applying for project" }, { status: 500 });
    }
}

