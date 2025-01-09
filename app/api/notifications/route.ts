import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb"; // Adjust the path based on your structure
import Notification from "../../models/Notification"; // Adjust the path based on your structure
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all notifications for a specific user
export async function GET(req: Request) {
  await connectMongo();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }); // Sort by newest first

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ message: "Error fetching notifications" }, { status: 400 });
  }
}

// POST: Delete a notification when marked as read
export async function POST(req: Request) {
    await connectMongo();
  
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  
      const { notificationId } = await req.json();
  
      // Delete the notification from the database
      const deletedNotification = await Notification.findByIdAndDelete(notificationId);
  
      if (!deletedNotification) {
        return NextResponse.json({ message: "Notification not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Notification deleted successfully", notification: deletedNotification }, { status: 200 });
    } catch (error) {
      console.error("Error deleting notification:", error);
      return NextResponse.json({ message: "Error deleting notification" }, { status: 400 });
    }
  }
  