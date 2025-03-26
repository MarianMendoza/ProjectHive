import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Deliverables from "@/app/models/Deliverables";
import mongoose from "mongoose";


export async function GET(req: Request) {
    await connectMongo();
    try {
        mongoose.set("strictPopulate", false);
        const deliverables = await Deliverables.find()
            .populate({
                path: "projectId", 
                select: "title projectAssignedTo.supervisorId", 
                populate: {
                    path: "projectAssignedTo.supervisorId", 
                    select: "name" 
                }
            })
            .populate({
                path: "projectId", 
                select: "title projectAssignedTo.secondReaderId", 
                populate: {
                    path: "projectAssignedTo.secondReaderId", 
                    select: "name" 
                }
            })
            .populate({
                path: "projectId", 
                select: "title projectAssignedTo.studentsId", 
                populate: {
                    path: "projectAssignedTo.studentsId", 
                    select: "name" 
                }
            })

        return NextResponse.json(deliverables, { status: 200 });

    } catch (error) {
        console.error("Error fetching deliverables", error);
        return NextResponse.json({ message: "Error fetching deliverables" }, { status: 400 });
    }
}