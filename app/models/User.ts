import mongoose, { Document, Schema } from 'mongoose';



export interface IUser extends Document {
  _id: string; // Using string for _id is fine, but using mongoose's ObjectId type is recommended for MongoDB compatibility
  imageUrl: string;
  name: string;
  email: string;
  course: string;
  description:string;
  password: string;
  role: 'student' | 'lecturer' | 'admin'; // Use a union type for better type safety
  approved: boolean; // Indicates whether the user is approved
}

const UserSchema: Schema = new Schema({
  imageUrl: {type:String, required: false},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  course: {type: String, required:false},
  description:{type:String, required:false},
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Lecturer', 'Admin'], default: 'student' },
  approved: { type: Boolean, default: false }, // Default to false for non-admin users
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
