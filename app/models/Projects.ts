import mongoose, { Document, Schema } from 'mongoose';



export interface IProjects extends Document {
  title: string;
  status: "Available" | "Unavailable" | "Archived";
  visibility: "Private" | "Public",
  description: string;
  files: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectsSchema: Schema = new Schema({
  title: { type: String, required: true },
  status: {type:String, enum: ["Available" , "Unavailable" , "Archived"], default:"Available"},
  visibility: {type:String, enum: ["Private" , "Public" ], default:"Available"},
  description:{type:String, required:false},
  files: { type: String, required: false },
  createdAt:{ type:Date, default:Date.now},
  updatedAt:{ type:Date, default:Date.now},

});

const Projects = mongoose.models.Projects || mongoose.model('Project', ProjectsSchema);
export default Projects;
