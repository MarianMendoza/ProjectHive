import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Deliverables from "@/app/models/Deliverables";
import mongoose from "mongoose";

// GET: Retrieve deliverables by project ID.
export async function GET(req: Request) {
  await connectMongo();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    // Validate the project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid Project ID" }, { status: 400 });
    }

    // Fetch deliverables associated with the project
    const deliverables = await Deliverables.findOne({ projectId: id });

    if (!deliverables) {
      return NextResponse.json({ message: "Deliverables not found" }, { status: 404 });
    }

    return NextResponse.json({ deliverables }, { status: 200 });
  } catch (error) {
    console.error("Error fetching deliverables:", error);
    return NextResponse.json({ message: "Error fetching deliverables" }, { status: 500 });
  }
}
