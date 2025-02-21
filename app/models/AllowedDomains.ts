import mongoose,{Document, Schema} from "mongoose";


export interface IAllowedDomain extends Document{
    domain: string;
}

const AllowedDomainSchema: Schema = new Schema({
    domain: { type: String, required: true, unique: true },
  });

export const AllowedDomain =
  mongoose.models.AllowedDomain || mongoose.model("AllowedDomain", AllowedDomainSchema);