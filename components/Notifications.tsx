"use client";

import { useSocket } from "@/app/provider";
import { useEffect, useState } from "react";
import { Notification } from "@/types/notification"; // Adjust the path based on your project structure
import {IProjects} from "@/app/models/Projects";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = useSocket();

  // Fetch existing notifications from the API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("../api/notifications", { method: "GET" });
        if (res.ok) {
          const data: Notification[] = await res.json();
          setNotifications(data);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on("getNotification", (data: Notification) => {
        setNotifications((prev) => [...prev, data]);
      });
    }

    // Cleanup to avoid duplicate listeners
    return () => {
      if (socket) {
        socket.off("getNotification");
      }
    };
  }, [socket]);

  const acceptInvitation = async (relatedProject: Object) => {
 
    let type;
    let user;

    
    const userId = relatedProject.receiversId.toString();
    const receiversId = [relatedProject.userId._id];
    const projectId = relatedProject.relatedProjectId._id;

    if (relatedProject.type == "Invitation"){
      type = "Invitation";
      user = {
        projectAssignedTo: {
          ...relatedProject.relatedProjectId.projectAssignedTo,
          secondReaderId: userId.toString(),
        }
      };
    } else {
      type = "InvitationSupervisorAccept";
      user = {
        projectAssignedTo: {
          ...relatedProject.relatedProjectId.projectAssignedTo,
          supervisorId: userId.toString(),
        }
      };
    }
    console.log(user);

     
    try {
      const res = await fetch(`../../api/projects/${projectId}`,{
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();


      if (res.ok){
        console.log("Project updated successfully!:", data);

         if (socket) {
          socket.emit("sendNotification", { userId, receiversId, projectId, type });
        } else {
          console.error("Socket is not initialized");
        }
        markAsRead(relatedProject._id);
      } else{
        console.error("Failed to update project:", data);
      }
    } catch (error) {
      console.error("Error accepting invitations:", error);  
    }
  };

  const declineInvitation = async (relatedProject: Object) => {
    // console.log(relatedProject);
    alert("You have sent a decline");
    let type;

    if (relatedProject.type === "InvitationDecline"){
      type = "InvitationDecline";
    } else {
      type = "InvitationSupervisorDecline"
    };

    //dont make this an array
    const userId = relatedProject.receiversId.toString();
    const receiversId = [relatedProject.userId._id];
    const projectId = relatedProject.relatedProjectId._id;

    // console.log(userId, receiversId, projectId , type);
    if (socket) {
      socket.emit("sendNotification", { userId, receiversId, projectId, type });
    } else {
      console.error("Socket is not initialized");
    }

    markAsRead(relatedProject._id);
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("../api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto h-[50vh] overflow-y-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">It's quiet in here...</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification._id}>
              <div
                className={`bg-gray-50 p-5 rounded-lg shadow-sm flex flex-col items-start ${
                  notification.isRead ? "opacity-50" : ""
                } transition-opacity duration-300`}
              >
                <p className="text-gray-800 font-medium mb-4">
                  {notification.message}
                </p>

                <div className="flex flex-col space-y-2 w-full">
                  {!notification.isRead && (
                    <button
                      className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition duration-200"
                      onClick={() => markAsRead(notification._id)}
                    >
                      Mark as Read
                    </button>
                  )}

                  {notification.type === "Invitation" &&
                    !notification.isRead && (
                      <div className="flex space-x-2 w-full">
                        <button
                          className="flex-grow px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition duration-200"
                          onClick={() => acceptInvitation(notification)}
                        >
                          Accept
                        </button>
                        <button
                          className="flex-grow px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                          onClick={() => declineInvitation(notification)}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {notification.type === "InvitationSupervisor" &&
                    !notification.isRead && (
                      <div className="flex space-x-2 w-full">
                        <button
                          className="flex-grow px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition duration-200"
                          onClick={() => acceptInvitation(notification)}
                        >
                          Accept
                        </button>
                        <button
                          className="flex-grow px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                          onClick={() => declineInvitation(notification)}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
