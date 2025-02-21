import mongoose, { Document, Schema } from "mongoose";
import { Tag } from "./Tags";

export interface IUser extends Document {
  _id: string;
  imageUrl: string;
  name: string;
  email: string;
  tags: mongoose.Types.ObjectId[];
  description: string;
  password: string;
  role: "Student" | "Lecturer" | "Admin"; // Use a union type for better type safety
  approved: boolean; // Indicates whether the user is approved
  assigned: boolean;
  pfpurl: string;
  

}

const UserSchema: Schema = new Schema({
  imageUrl: {type:String, required: false},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  tags: {type: Schema.Types.ObjectId, ref:Tag},
  description:{type:String, required:false},
  password: { type: String, required: true },
  role: { type: String, enum: ["Student", "Lecturer", "Admin"], default: "Student" },
  assigned: {type:Boolean, default: false},
  approved: { type: Boolean, default: false }, 
  pfpurl: {type: String, default: ""},
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
