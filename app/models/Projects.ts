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
    applicationStatus: "Pending" | "Assigned" | "Rejected"
  }[];
  description: string;
  files: string;
  createdAt: Date;
  updatedAt: Date;
  expiredAt: Date;
}
// When a project does not have a supervisorID, and the author is a student, the student will not be able to "Apply", their id
// will automatically add to the list of applicants. When the project has been adopted by a lecturer, the invite will immediately assign 
//the author student as the applicant and the project will not be available to other student. Their others projects will remain unapplicable and the project will remain as an "Orphan".
//The author student will be able to edit it as normal. However no student will be able to apply to another student project. This will be assumed.

// Define the schema for the projects
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
      applicationStatus: {type: String, enum: ["Pending", "Assigned","Rejected"], default: "Pending"},
      _id: false
    },
  ],
  description: { type: String, required: false },
  files: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiredAt: {type: Date, default: null} //This will be set by admin, date expiry for the next academic year.
});

// Check if the model already exists. If not, create it
const Projects = mongoose.models.Projects || mongoose.model<IProjects>('Projects', ProjectsSchema);

export default Projects;
