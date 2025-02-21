import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Deliverables from "@/app/models/Deliverables";

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // Find the deliverable associated with the project
    const deliverable = await Deliverables.findOne({ projectId });

    if (!deliverable) {
      return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
    }

    const { outlineDocument, extendedAbstract, finalReport } = deliverable;
    const fileUrls = {
      outlineDocument: outlineDocument?.file || null,
      extendedAbstract: extendedAbstract?.file || null,
      finalReport: finalReport?.file || null,
    };

    return NextResponse.json({ success: true, fileUrls });
  } catch (error) {
    console.error("Error fetching deliverables:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
