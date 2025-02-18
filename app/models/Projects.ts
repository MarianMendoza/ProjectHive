import mongoose, { Document, Schema } from 'mongoose';


export interface IProjects extends Document {
  title: string;
  status: boolean;
  visibility: "Private" | "Public";
  projectAssignedTo: {
    supervisorId: mongoose.Types.ObjectId | null;
    secondReaderId: mongoose.Types.ObjectId | null;
    studentsId: mongoose.Types.ObjectId[] | null;
    authorId: mongoose.Types.ObjectId| null;
  };
  applicants: { 
    studentId: mongoose.Types.ObjectId, 
  }[];
  //Queue FIFO, lecturer dashboard
  abstract: string;
  description: string;
  files: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectsSchema: Schema = new Schema({
  title: { type: String, required: true },
  status: { type: Boolean, required:true},
  visibility: { type: String, enum: ["Private", "Public"], default: "Private" },
  projectAssignedTo: {
    supervisorId:{ type: mongoose.Types.ObjectId, ref: "User" },
    secondReaderId:{ type: mongoose.Types.ObjectId, ref: "User" },
    studentsId:[{ type: mongoose.Types.ObjectId, ref: "User"}],
    authorId: {type:mongoose.Types.ObjectId, ref: "User"},
  }, 
  applicants: [
    {
      studentId: {type: mongoose.Types.ObjectId, ref: "User"},
    },
  ],
  abstract: {type: String, required: false },
  description: { type: String, required: false },
  files: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Projects = mongoose.models.Projects || mongoose.model<IProjects>('Projects', ProjectsSchema);

export default Projects;
