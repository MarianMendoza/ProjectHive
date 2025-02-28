import { NextResponse } from "next/server";
import connectMongo from "../../../../lib/mongodb";
import Projects from "../../../models/Projects";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import Deliverables from "@/app/models/Deliverables";

// GET: Retrieve a project by ID.
export async function GET(req: Request) {
    await connectMongo();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    try {
        const project = await Projects.findById(id).populate({
            path: "applicants.studentId",
            select: "name"
        }).populate({
            path: "projectAssignedTo.supervisorId",
            select: "name"
        }).populate({
            path: "projectAssignedTo.secondReaderId",
            select: "name"
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

        const deletedDeliverables = await Deliverables.findOneAndDelete({ projectId: id });


        return NextResponse.json(
            {
                message: "Project and associated deliverables deleted successfully",
                deletedDeliverables: deletedDeliverables ? true : false,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ message: "Error deleting project" }, { status: 500 });
    }
}

//PUT: update project id
export async function PUT(req: Request) {
    await connectMongo();

    const id = req.url.split("/").pop() as string; // Extract project ID from the URL
    const { title, status, visibility, abstract, description, files, projectAssignedTo, applicants } = await req.json();

    try {
        const assignedStudentsIds = projectAssignedTo?.studentsId || [];
        const normalizedAssignedIds = assignedStudentsIds.map((id: string) => new mongoose.Types.ObjectId(id));

        // Prepare the data to be updated
        const updatedProjectData: any = {
            title,
            status,
            visibility,
            abstract,
            description,
            files,
            updatedAt: new Date(),
        };

        // Need to handle what happens if something
        if (projectAssignedTo) {
            updatedProjectData.projectAssignedTo = { 
                ...projectAssignedTo, 
                studentsId: normalizedAssignedIds 
            };
        
            // Update studentId only if a new value is provided
            if (projectAssignedTo.studentId == undefined) {
                updatedProjectData.projectAssignedTo.studentId = 
                    mongoose.Types.ObjectId.isValid(projectAssignedTo.studentId) 
                        ? new mongoose.Types.ObjectId(projectAssignedTo.studentId) 
                        : null;
            }
        
            // Update supervisorId only if a new value is provided
            if (projectAssignedTo.supervisorId == undefined) {
                updatedProjectData.projectAssignedTo.supervisorId = 
                    mongoose.Types.ObjectId.isValid(projectAssignedTo.supervisorId) 
                        ? new mongoose.Types.ObjectId(projectAssignedTo.supervisorId) 
                        : null;
            }
        
            // Update secondReaderId only if a new value is provided
            if (projectAssignedTo.secondReaderId == undefined) {
                updatedProjectData.projectAssignedTo.secondReaderId = 
                    mongoose.Types.ObjectId.isValid(projectAssignedTo.secondReaderId) 
                        ? new mongoose.Types.ObjectId(projectAssignedTo.secondReaderId) 
                        : null;

            }
        } else {
            updatedProjectData.projectAssignedTo = {
                ...projectAssignedTo,
                studentsId: normalizedAssignedIds,
            };
        }
        


        // If applicants are provided, update them accordingly
        if (applicants && applicants.length > 0) {
            const updatedApplicants = applicants.map((applicant: any) => {
                if (!applicant.studentId) {
                    return null
                }
                return { ...applicant, studentId: applicant.studentId._id || applicant.studentId };
            }).filter(Boolean);
            updatedProjectData.applicants = updatedApplicants;
        }

        // Perform the update on the project in the database
        const updatedProject = await Projects.findByIdAndUpdate(
            id,
            updatedProjectData,
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

// POST: Add or Withdraw from a project
export async function POST(req: Request) {
    await connectMongo();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop() as string;

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 403 });
    }

    if (!id) {
        return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    try {
        const project = await Projects.findById(id);
        // console.log(project)

        if (!project) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        const userId = session.user.id;

        if (session.user.role === "Student") {
            // Ensure applicants and projectAssignedTo.studentsId are initialized and are arrays
            const applicants = project.applicants || [];
            const assignedStudents = project.projectAssignedTo?.studentsId || [];
            console.log("Project Assigned Students", assignedStudents);
        
            // Check if the student is in the applicants list
            const isInApplicants = applicants.some(
                (applicant) => applicant.studentId?.toString() === userId
            );
        
            // Check if the student is in the assigned students list
            const isAssigned = assignedStudents.some(
                (id) => id === userId
            );

            console.log(isAssigned)
        
            if (!isInApplicants && !isAssigned) {
                project.applicants.push({ studentId: userId });
                await project.save();
                return NextResponse.json({ message: "You have successfully applied to the project." }, { status: 200 });
            }
        
            if (isInApplicants && isAssigned) {
                console.log(userId);
            
                project.projectAssignedTo.studentsId = project.projectAssignedTo.studentsId || [];
                if (!userId) {
                    return NextResponse.json({ message: "Invalid user ID." }, { status: 400 });
                }
                project.projectAssignedTo.studentsId = project.projectAssignedTo.studentsId.filter(
                    (id) => id !== userId
                );
            
                if (project.projectAssignedTo.studentsId.length === 0) {
                    console.log("No students are assigned to this project anymore.");
                }
            
                await project.save();
            
                return NextResponse.json({ message: "You have successfully withdrawn from the project as an assigned student, but remain in applicants." }, { status: 200 });
            }
            
        
            if (isInApplicants && !isAssigned) {
                // If the student is in applicants but not assigned, and presses withdraw, remove them from applicants
                project.applicants = project.applicants.filter(
                    (applicant) => applicant.studentId?.toString() !== userId
                );
                await project.save();
                return NextResponse.json({ message: "You have successfully withdrawn from the project." }, { status: 200 });
            }
        
            // If the student is in applicants but not assigned, assign them to the project
            if (isInApplicants && !isAssigned) {
                // Remove from applicants
                project.applicants = project.applicants.filter(
                    (applicant) => applicant.studentId?.toString() !== userId
                );
        
                // Add the student to the assigned students list
                project.projectAssignedTo.studentsId.push(userId);
        
                await project.save();
                return NextResponse.json({ message: "You have successfully been assigned to the project." }, { status: 200 });
            }
        }
        
        
        
        

        if (session.user.role === "Lecturer") {
            // If the user is a supervisor or second reader, handle both adding and withdrawing
            const isSupervisor = project.projectAssignedTo.supervisorId?.toString() === userId;
            const isSecondReader = project.projectAssignedTo.secondReaderId?.toString() === userId;

            if (!isSupervisor && !isSecondReader) {
                // If not a supervisor or second reader, add them
                const { role } = await req.json(); // Role should be either 'supervisor' or 'secondReader'

                if (role === "supervisor") {
                    project.projectAssignedTo.supervisorId = userId;
                } else if (role === "secondReader") {
                    project.projectAssignedTo.secondReaderId = userId;
                }

                await project.save();
                return NextResponse.json({ message: `${role} added to the project successfully.` }, { status: 200 });
            }

            // If the user is already assigned, remove them (withdraw)
            if (isSupervisor) {
                project.projectAssignedTo.supervisorId = null;
            }

            if (isSecondReader) {
                project.projectAssignedTo.secondReaderId = null;
            }

            await project.save();
            return NextResponse.json({ message: "You have successfully withdrawn from the project." }, { status: 200 });
        }

        return NextResponse.json({ message: "Unauthorized action." }, { status: 403 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: "Error processing the request" }, { status: 500 });
    }
}



