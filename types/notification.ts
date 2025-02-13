import { User } from "./users"; // Adjust the path based on your project structure
import { Project } from "./projects"; // Assuming you have the Project type in a separate file
import { Date } from "mongoose";

export interface Notification {
  _id: string; // Unique identifier for the notification
  userId: User; // The user to whom the notification is sent
  receiversId:User[];
  message: string; // The notification message
  messageUser: string;
  type: "ApplicationStudent" | "StudentAccept" |"StudentDecline"|"Closed" | "InvitationSecondReader" | "DeclineSecondReader" |"AcceptSecondReader" | "UnassignSecondReader" | "InvitationSupervisor"| "SupervisorDecline" | "SupervisorAccept" | "GradesPublished"; // Type of notification
  relatedProjectId: Project | null; // The project associated with the notification, if any
  isRead: boolean; // Whether the notification has been read
  timestamp: Date; 
}
