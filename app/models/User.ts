import mongoose, { Document, Schema } from 'mongoose';

// Define the IUser interface
export interface IUser extends Document {
  _id: string; // Using string for _id is fine, but using mongoose's ObjectId type is recommended for MongoDB compatibility
  name: string;
  email: string;
  password: string;
  role: 'student' | 'lecturer' | 'admin'; // Use a union type for better type safety
  approved: boolean; // Indicates whether the user is approved
}

// Define the UserSchema using Mongoose Schema
const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
  approved: { type: Boolean, default: false }, // Default to false for non-admin users
});

// Create the User model or use the existing one
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
