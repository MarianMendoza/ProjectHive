import Deliverables from "@/app/models/Deliverables";
import connectMongo from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectMongo();

  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
      return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
  }

  try {
      const deliverables = await Deliverables.findOne({ projectId: new mongoose.Types.ObjectId(projectId) })
          .populate({
              path: "projectId",
              select: "projectAssignedTo",
              populate: [
                  {
                      path: "projectAssignedTo.supervisorId",
                      select: "_id"
                  },
                  {
                      path: 'projectAssignedTo.secondReaderId', 
                      select: '_id'
                  }
              ]

          }).populate('deadlineId', 'outlineDocumentDeadline extendedAbstractDeadline finalReportDeadline');

      

      if (!deliverables) {
          return NextResponse.json({ message: "Deliverables not found" }, { status: 404 });
      }

      return NextResponse.json({ deliverables }, { status: 200 });
  } catch (error) {
      console.error("Error fetching deliverables:", error);
      return NextResponse.json({ message: "Error fetching deliverables" }, { status: 500 });
  }
}


export async function PUT(req: Request) {
    await connectMongo();
  
    const deliverableId = req.url.split("/").pop() as string;
  
    if (!deliverableId) {
      return NextResponse.json(
        { message: "DeliverableId is required" },
        { status: 400 }
      );
    }

    try {
   
      const body = await req.json();
  
      const updatedDeliverables = await Deliverables.findByIdAndUpdate(
        deliverableId,
        { $set: body },
        { new: true, runValidators: true }
      );
  
      if (!updatedDeliverables) {
        return NextResponse.json(
          { message: "Deliverables not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { deliverables: updatedDeliverables },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating deliverables:", error);
      return NextResponse.json(
        { message: "Error updating deliverables" },
        { status: 500 }
      );
    }
  }