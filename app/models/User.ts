import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  tag: string;
  description: string;
  password: string;
  role: "Student" | "Lecturer" | "Admin"; // Use a union type for better type safety
  approved: boolean; // Indicates whether the user is approved
  assigned: boolean;
  emailNotifications: boolean;
  pfpurl: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  tag: {type: String},
  description:{type:String, required:false},
  password: { type: String, required: true },
  role: { type: String, enum: ["Student", "Lecturer", "Admin"], default: "Student" },
  assigned: {type:Boolean, default: false},
  approved: { type: Boolean, default: false }, 
  emailNotifications: {type: Boolean, default: false},
  pfpurl: {type: String, default: ""},
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
