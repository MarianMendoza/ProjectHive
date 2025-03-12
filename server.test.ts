import { Server } from "socket.io";
import mongoose from "mongoose";
import { createServer } from "http";
import connectMongo from "./lib/mongodb"; // Adjust import path as necessary
import Notification from "./app/models/Notification";
import User from "./app/models/User";
import Projects from "./app/models/Projects";
import { startServer } from "server"; // Adjust path to your server file

// Mock socket.io and mongoose
jest.mock("socket.io", () => {
  return {
    Server: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      emit: jest.fn(),
      listen: jest.fn(),
    })),
  };
});

jest.mock("./lib/mongodb", () => ({
  connectMongo: jest.fn(),
}));

jest.mock("./app/models/Notification", () => ({
  Notification: {
    save: jest.fn(),
  },
}));

jest.mock("./app/models/User", () => ({
  User: {
    findById: jest.fn(),
  },
}));

jest.mock("./app/models/Projects", () => ({
  Projects: {
    findById: jest.fn(),
  },
}));

describe("Socket.IO Server Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should connect to MongoDB", async () => {
    connectMongo.mockResolvedValueOnce("MongoDB connected");

    await startServer();

    expect(connectMongo).toHaveBeenCalled();
  });

  test("should handle socket connection", async () => {
    const io = new Server();
    const mockSocket = {
      id: "socket-id",
      on: jest.fn(),
      emit: jest.fn(),
    };

    io.on("connection", mockSocket.on);

    const socketEvent = io.on.mock.calls[0][1]; // This will be the connection handler
    socketEvent(mockSocket);

    expect(mockSocket.on).toHaveBeenCalledTimes(1);
    expect(mockSocket.emit).toHaveBeenCalledWith("getNotification", expect.any(Object));
  });

  test("should register user and add to online users", async () => {
    const io = new Server();
    const mockSocket = {
      id: "socket-id",
      on: jest.fn(),
      emit: jest.fn(),
    };
    const addUserMock = jest.fn();
    const removeUserMock = jest.fn();
    io.on("connection", (socket) => {
      socket.on("registerUser", (userId) => {
        addUserMock(userId, socket.id);
      });
      socket.on("disconnect", () => {
        removeUserMock(socket.id);
      });
    });

    const socketEvent = io.on.mock.calls[0][1]; // Connection handler
    socketEvent(mockSocket);
    
    // Simulate user registration
    mockSocket.emit("registerUser", "user-id");
    expect(addUserMock).toHaveBeenCalledWith("user-id", "socket-id");
  });

  test("should save notification to the database", async () => {
    const user = { _id: "user-id", name: "John Doe" };
    const project = { _id: "project-id", title: "Project 1" };

    // Mock the necessary database calls
    User.findById.mockResolvedValueOnce(user);
    Projects.findById.mockResolvedValueOnce(project);
    
    const mockNotification = {
      save: jest.fn(),
    };
    
    Notification.save.mockResolvedValueOnce(mockNotification);

    // Simulate sending a notification
    const socket = {
      emit: jest.fn(),
      id: "socket-id",
      on: jest.fn(),
    };

    const messageUser = "admin";
    const receiversId = ["receiver-id"];
    const projectId = "project-id";
    const type = "ApplicationStudent";

    const emitNotification = jest.fn();
    
    // Create the notification
    const notification = new Notification({
      userId: user._id,
      receiversId: receiversId,
      message: `${user.name} applied to your project ${project.title}`,
      messageUser: messageUser,
      type: type,
      relatedProjectId: projectId,
      timestamp: new Date().toISOString(),
    });

    await notification.save();
    
    expect(Notification.save).toHaveBeenCalled();
    expect(notification.save).toHaveBeenCalledWith();
  });

  test("should emit notification to the correct receiver socket", async () => {
    const io = new Server();
    const mockSocket = {
      emit: jest.fn(),
    };
    io.on("connection", (socket) => {
      socket.on("sendNotification", (data) => {
        socket.emit("getNotification", data); // Emitting notification
      });
    });

    const socketEvent = io.on.mock.calls[0][1];
    socketEvent(mockSocket);

    // Sending the notification
    const messageData = { message: "Test notification", receiversId: ["receiver-id"] };

    await mockSocket.emit("sendNotification", messageData);
    expect(mockSocket.emit).toHaveBeenCalledWith("getNotification", messageData);
  });
});

