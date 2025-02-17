import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb"; // Adjust the path based on your structure
import Notification from "../../../models/Notification"; // Adjust the path based on your structure
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(req: Request) {
    await connectMongo();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop
  
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  
      const receiverId = id;
  
      const notifications = await Notification.find({receiversId: {$in: [receiverId]}}).sort({ createdAt: -1 }).populate({
        path: "userId",
        select: "name"
      })
      .populate({
        path: "relatedProjectId",
        select: "title projectAssignedTo"
      }) 
      .populate({
        path: "receiverId",
        select: "name"
      }); // Sort by newest first
  
      return NextResponse.json(notifications, { status: 200 });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json({ message: "Error fetching notifications" }, { status: 400 });
    }
  }