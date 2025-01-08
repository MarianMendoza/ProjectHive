import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Deliverables from "@/app/models/Deliverables";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    await connectMongo();

    const { projectId } = params;

    if (!projectId) {
        return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }

    try {
        // Fetch deliverables based on the projectId
        const deliverables = await Deliverables.findOne({ projectId: new mongoose.Types.ObjectId(projectId) });
        
        if (!deliverables) {
            return NextResponse.json({ message: "Deliverables not found" }, { status: 404 });
        }

        return NextResponse.json({ deliverables }, { status: 200 });
    } catch (error) {
        console.error("Error fetching deliverables:", error);
        return NextResponse.json({ message: "Error fetching deliverables" }, { status: 500 });
    }
}
