import Notification from "../models/Notification";
import { INotification } from "../models/Notification";
import mongoose from "mongoose";

/**
 * Create a new notification
 * @param userId - The ID of the user sending the notification
 * @param receiversId - Array of recipient user IDs
 * @param message - Notification message
 * @param messageUser - Additional message details
 * @param type - Type of notification
 * @param relatedProjectId - Associated project ID
 * @returns The created notification object
 */
export const createNotification = async (
  userId: mongoose.Types.ObjectId,
  receiversId: mongoose.Types.ObjectId[],
  message: string,
  messageUser: string,
  type: INotification["type"],
  relatedProjectId: mongoose.Types.ObjectId
) => {
  try {
    const newNotification = new Notification({
      userId,
      receiversId,
      message,
      messageUser,
      type,
      relatedProjectId,
      isRead: false,
      timestamp: new Date(),
    });

    await newNotification.save();
    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification.");
  }
};

/**
 * Fetch all notifications for a user
 * @param userId - The ID of the user whose notifications are being fetched
 * @returns Array of notifications
 */
export const getNotificationsForUser = async (userId: mongoose.Types.ObjectId) => {
  try {
    return await Notification.find({ receiversId: userId }).sort({ timestamp: -1 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to retrieve notifications.");
  }
};

/**
 * Mark a notification as read
 * @param notificationId - The ID of the notification to mark as read
 * @returns The updated notification
 */
export const markNotificationAsRead = async (notificationId: mongoose.Types.ObjectId) => {
  try {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating notification:", error);
    throw new Error("Failed to mark notification as read.");
  }
};

/**
 * Send a real-time notification via WebSocket (if applicable)
 * @param socket - The socket instance
 * @param userId - Sender ID
 * @param receiversId - Array of receiver IDs
 * @param projectId - Associated project ID
 * @param type - Type of notification
 * @param message - Notification message
 */
export const sendRealTimeNotification = (
  socket: any,
  userId: mongoose.Types.ObjectId,
  receiversId: mongoose.Types.ObjectId[],
  projectId: mongoose.Types.ObjectId,
  type: INotification["type"],
  message: string
) => {
  if (socket) {
    socket.emit("sendNotification", {
      userId,
      receiversId,
      projectId,
      type,
      message,
    });
  } else {
    console.error("Socket is not initialized");
  }
};
