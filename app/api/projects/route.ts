import { NextResponse } from "next/server";
import connectMongo from "../../../lib/mongodb"; // Adjust the path based on your project structure
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import Projects from "../../models/Projects"
import Deliverables from "@/app/models/Deliverables";
import Deadlines from "@/app/models/Deadlines";
import { Project } from "@/types/projects";
import User from "@/app/models/User";
// POST: Create a new project
export async function POST(req: Request) {
    await connectMongo();

    const { title, status, programme, visibility, description,abstract, files } = await req.json();

    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }
    
        const userId = session.user.id;
        const userRole = session.user.role;
        let supervisorId = null;
        let studentId = null;

        if (!userId){
            return NextResponse.json({message: "Username not found in the session"},{status: 400});
        }

        if(userRole == "Lecturer" ){
            supervisorId = userId;
        } 
        if (userRole == "Student"){
            await User.findByIdAndUpdate(userId, { assigned: true });
            studentId = userId;
        } 
        
        const newProject = new Projects({
            title,
            status,
            programme,
            visibility,
            abstract,
            description,
            files,
            projectAssignedTo: {
                supervisorId,
                secondReaderId: null,
                studentsId: [studentId],
                authorId: userId,
            },
            applicants: {
                studentId: studentId,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const savedProject = await newProject.save();
        const deadline = await Deadlines.findOne();


        const newDeliverables = new Deliverables({
            projectId: savedProject._id,
            deadlineId: deadline._id, // Only if a deadline exists
            outlineDocument: {
              file: null,
              uploadedAt: null
            },
            extendedAbstract: {
              file: null,
              uploadedAt: null
            },
            finalReport: {
              file: null,
              uploadedAt: null
            },
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await newDeliverables.save();
          

        await newDeliverables.save();

        return NextResponse.json({ message: "Project and Deliverables created successfully", project: savedProject }, { status: 201 });
    } catch (error) {
        console.error("Error creating project or deliverables:", error);
        return NextResponse.json({ message: "Error creating project or deliverables" }, { status: 400 });
    }
}

// GET: Fetch all projects
export async function GET(req: Request) {
    await connectMongo();

    try {
        mongoose.set("strictPopulate", false);

        const projects = await Projects.find()
        .populate({
            path: "projectAssignedTo.supervisorId",
            select: "name"
        })
        .populate({
            path: "projectAssignedTo.secondReaderId",
            select: "name"
        })
        .populate({
            path: "projectAssignedTo.studentsId",
            select: "name"
        })
        .populate({
            path: "projectAssignedTo.authorId",
            select: "name"
        })
        .populate({
            path: "applicants.studentId",
            select: "name"
        }).lean();

        const deliverables = await Deliverables.find().lean();

        const projectsWithDeliverables = projects.map((project) => {
            const projectDeliverables = deliverables.find((d) => d.projectId.toString() === project._id.toString());
            return {
                ...project,
                deliverables: projectDeliverables || null,
            };
        });
        

        return NextResponse.json(projectsWithDeliverables, { status: 200 });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ message: "Error fetching projects" }, { status: 400 });
    }
}



