import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Deadline from "@/app/models/Deadlines";
import Deliverables from "@/app/models/Deliverables";

export async function GET(req: Request){
  await connectMongo();

  try {
    const deadlines = await Deadline.find();

    return NextResponse.json(deadlines,{status: 200});
  } catch (error) {
    console.error("Error fetching deadlines.", error);
    return NextResponse.json({message: "Error fetching users"}, {status: 400});
  }
}


export async function PUT(req: Request) {
  await connectMongo();

  const { outlineDocumentDeadline, extendedAbstractDeadline, finalReportDeadline, openDayDate, pastProjectDate } = await req.json();

  try {
    const existingDeadline = await Deadline.findOne({});

    if (existingDeadline) {
      existingDeadline.outlineDocumentDeadline = new Date(outlineDocumentDeadline);
      existingDeadline.extendedAbstractDeadline = new Date(extendedAbstractDeadline);
      existingDeadline.finalReportDeadline = new Date(finalReportDeadline);
      existingDeadline.openDayDate = new Date(openDayDate);
      existingDeadline.pastProjectDate = new Date(pastProjectDate);

      await existingDeadline.save();

      await Deliverables.updateMany(
        {},
        { $set: { deadlineId: existingDeadline._id } } // Set the deadlineId in the Deliverables collection
      );

      return NextResponse.json({ message: "Deadline updated successfully" }, { status: 200 });
    } else {
      const deadline = new Deadline({
        outlineDocumentDeadline: new Date(outlineDocumentDeadline),
        extendedAbstractDeadline: new Date(extendedAbstractDeadline),
        finalReportDeadline: new Date(finalReportDeadline),
        openDayDate: new Date(openDayDate),
        pastProjectDate: new Date(pastProjectDate),
      });

      await deadline.save();

      await Deliverables.updateMany(
        {}, 
        { $set: { deadlineId: deadline._id } } 
      );

      return NextResponse.json({ message: "Deadline created successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating or creating deadline:", error);
    return NextResponse.json({ message: "Error updating or creating deadline" }, { status: 500 });
  }
}
