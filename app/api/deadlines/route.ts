import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Deadline from "@/app/models/Deadlines";
import Deliverables from "@/app/models/Deliverables";

export async function PUT(req: Request) {
  await connectMongo();

  const { outlineDocumentDeadline, extendedAbstractDeadline, finalReportDeadline, openDayDate } = await req.json();

  // Validate the received data
  if (!outlineDocumentDeadline || !extendedAbstractDeadline || !finalReportDeadline || !openDayDate) {
    return NextResponse.json({ message: "All date fields are required" }, { status: 400 });
  }

  try {
    // Check if a deadline already exists
    const existingDeadline = await Deadline.findOne({});

    if (existingDeadline) {
      // If a deadline exists, update the existing one
      existingDeadline.outlineDocumentDeadline = new Date(outlineDocumentDeadline);
      existingDeadline.extendedAbstractDeadline = new Date(extendedAbstractDeadline);
      existingDeadline.finalReportDeadline = new Date(finalReportDeadline);
      existingDeadline.openDayDate = new Date(openDayDate);

      // Save the updated deadline
      await existingDeadline.save();

      // Optionally update deliverables if needed
      await Deliverables.updateMany(
        {}, // Update all Deliverables
        { $set: { deadlineId: existingDeadline._id } } // Set the deadlineId in the Deliverables collection
      );

      return NextResponse.json({ message: "Deadline updated successfully" }, { status: 200 });
    } else {
      // If no deadline exists, create a new one
      const deadline = new Deadline({
        outlineDocumentDeadline: new Date(outlineDocumentDeadline),
        extendedAbstractDeadline: new Date(extendedAbstractDeadline),
        finalReportDeadline: new Date(finalReportDeadline),
        openDayDate: new Date(openDayDate),
      });

      // Save the new Deadline document
      await deadline.save();

      // Update all Deliverables to reference this new Deadline document
      await Deliverables.updateMany(
        {}, // Update all Deliverables
        { $set: { deadlineId: deadline._id } } // Set the deadlineId in the Deliverables collection
      );

      return NextResponse.json({ message: "Deadline created successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating or creating deadline:", error);
    return NextResponse.json({ message: "Error updating or creating deadline" }, { status: 500 });
  }
}
