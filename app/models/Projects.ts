import mongoose, { Document, Schema } from 'mongoose';

export interface IProjects extends Document {
  title: string;
  status: "Available" | "Unavailable" | "Archived";
  visibility: "Private" | "Public";
  projectAssignedTo: {
    supervisorId: mongoose.Types.ObjectId | null;
    secondReaderId: mongoose.Types.ObjectId | null;
    studentsId: mongoose.Types.ObjectId[];
    authorId: mongoose.Types.ObjectId| null;
  };
  description: string;
  files: string;
  createdAt: Date;
  updatedAt: Date;
  expiredAt: Date;
}

// Define the schema for the projects
const ProjectsSchema: Schema = new Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["Available", "Unavailable", "Archived"], default: "Available" },
  visibility: { type: String, enum: ["Private", "Public"], default: "Private" },
  projectAssignedTo: {
    supervisorId:{ type: mongoose.Types.ObjectId, ref: "User", default:null},
    secondReaderId:{ type: mongoose.Types.ObjectId, ref: "User", default:null},
    studentId:{ type: mongoose.Types.ObjectId, ref: "User", default:[]},
    authorId: {type:mongoose.Types.ObjectId,ref: "User", default: null},
  }, 
  description: { type: String, required: false },
  files: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiredAt: {type: Date, default: null} //This will be set by admin, date expiry for the next academic year.
});

// Check if the model already exists. If not, create it
const Projects = mongoose.models.Projects || mongoose.model<IProjects>('Projects', ProjectsSchema);

export default Projects;
