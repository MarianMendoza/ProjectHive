import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // User to whom the notification is sent
  receiversId: mongoose.Types.ObjectId[];
  message: string; // Notification message
  messageUser: string;
  type: "ApplicationStudent" | "StudentAccept" |"StudentDecline"|"Closed" | "InvitationSecondReader" | "DeclineSecondReader" |"AcceptSecondReader" | "UnassignSecondReader" | "InvitationSupervisor"| "SupervisorDecline" | "SupervisorAccept" ; // Type of notification
  relatedProjectId: mongoose.Types.ObjectId ; // Optional: Associated project ID
  isRead: boolean; // Whether the notification has been read
  timestamp: Date; // When the notification was created
}

const NotificationSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // Reference to the user
  receiversId: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }], // Reference to the user
  message: { type: String, required: false }, // Notification message
  messageUser : {type: String, required: false},
  type: { type: String, enum: ["ApplicationStudent", "StudentAccept","StudentDecline","Closed", "InvitationSecondReader", "DeclineSecondReader","AcceptSecondReader", "UnassignSecondReader", "InvitationSupervisor", "SupervisorDecline", "SupervisorAccept"] }, // Type of notification
  relatedProjectId: { type: mongoose.Types.ObjectId, ref: "Projects", default: null }, // Optional reference to a project
  isRead: { type: Boolean, default: false }, // Default to unread
  timestamp: { type: Date, default: Date.now }, // Auto-set creation date
});

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
