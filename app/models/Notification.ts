import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // User to whom the notification is sent
  receiversId: mongoose.Types.ObjectId[];
  message: string; // Notification message
  type: "Application" | "Invitation" | "InvitationDecline" |"InvitationAccept" | "Update" | "General" | "Closed"; // Type of notification
  relatedProjectId: mongoose.Types.ObjectId | null; // Optional: Associated project ID
  isRead: boolean; // Whether the notification has been read
  createdAt: Date; // When the notification was created
}

const NotificationSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // Reference to the user
  receiversId: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }], // Reference to the user
  message: { type: String, required: false }, // Notification message
  type: { type: String, enum: ["Application", "Invitation", "InvitationDecline" ,"InvitationAccept",  "Update", "General", "Closed"], default: "General" }, // Type of notification
  relatedProjectId: { type: mongoose.Types.ObjectId, ref: "Projects", default: null }, // Optional reference to a project
  isRead: { type: Boolean, default: false }, // Default to unread
  createdAt: { type: Date, default: Date.now }, // Auto-set creation date
});

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
