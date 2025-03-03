import mongoose,{Document, Schema} from "mongoose";

export interface IProgramme extends Document {
    name: string;
  }

const ProgrammeSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
});

export const Programme = mongoose.models.Programme || mongoose.model("Programme", ProgrammeSchema);
export default Programme;