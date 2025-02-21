import mongoose,{Document, Schema} from "mongoose";

export interface ITag extends Document {
    name: string;
  }
  
  const TagSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
  });
  
  export const Tag = mongoose.models.Tag || mongoose.model("Tag", TagSchema);