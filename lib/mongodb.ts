import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const  MONGODB_URI = process.env.MONGODB_URI;
// console.log("In mongodb", MONGODB_URI);
export const connectMongo = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    console.log("Connecting to MongoDB URI:", MONGODB_URI); // Debug log
    const { connection } = await mongoose.connect(MONGODB_URI);
    if (connection.readyState === 1) {
      console.log("Connected to MongoDB");
      return Promise.resolve(true);
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return Promise.reject(error);
  }
};

export default connectMongo;
