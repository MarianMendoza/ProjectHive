import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string; // You can also use mongoose's ObjectId type
  name: string;
  email: string;
  password: string;
  role: string; // 'student' or 'lecturer'
  approved: boolean; // Whether the user is approved
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'lecturer','admin'], default: 'student' },
  approved: { type: Boolean, default: false }, // Default to false for lecturers
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
