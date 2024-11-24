import mongoose, { Document, Schema } from "mongoose";



export interface IUser extends Document {
  _id: string;
  imageUrl: string;
  name: string;
  email: string;
  course: string;
  description: string,
  password: string;
  role: "Student" | "Lecturer" | "Admin"; // Use a union type for better type safety
  approved: boolean; // Indicates whether the user is approved
}

const UserSchema: Schema = new Schema({
  imageUrl: {type:String, required: false},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  course: {type: String, required:false},
  description:{type:String, required:false},
  password: { type: String, required: true },
  role: { type: String, enum: ["Student", "Lecturer", "Admin"], default: "Student" },
  approved: { type: Boolean, default: false }, // Default to false for non-admin users
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
