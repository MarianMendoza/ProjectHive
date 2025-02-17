import Deliverables from "@/app/models/Deliverables";
import connectMongo from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    await connectMongo();
  
    const deliverableId = req.url.split("/").pop() as string;
    const { supervisorGrade, supervisorFeedback, secondReaderGrade, secondReaderFeedback } = await req.json;

  
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