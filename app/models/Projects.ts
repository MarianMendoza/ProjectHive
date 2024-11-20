import mongoose, { Document, Schema } from 'mongoose';

export interface IProjects extends Document {
  title: string;
  status: "Available" | "Unavailable" | "Archived";
  visibility: "Private" | "Public";
  description: string;
  files: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for the projects
const ProjectsSchema: Schema = new Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["Available", "Unavailable", "Archived"], default: "Available" },
  visibility: { type: String, enum: ["Private", "Public"], default: "Private" },
  description: { type: String, required: false },
  files: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Check if the model already exists. If not, create it
const Projects = mongoose.models.Projects || mongoose.model<IProjects>('Projects', ProjectsSchema);

export default Projects;
