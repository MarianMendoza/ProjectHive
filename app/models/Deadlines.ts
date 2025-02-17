import mongoose, { Schema, Document } from 'mongoose';

// Define the Deadline schema
const DeadlineSchema = new Schema({
  outlineDocumentDeadline: { type: Date, default:null },
  extendedAbstractDeadline: { type: Date, default:null },
  finalReportDeadline: { type: Date, default:null },
  openDayDate: {type: Date, default:null},
  pastProjectDate: {type:Date, default:null},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Interface for Deadline
export interface IDeadline extends Document {
  outlineDocumentDeadline: Date;
  extendedAbstractDeadline: Date;
  finalReportDeadline: Date;
  openDayDate: Date;
  pastProjectDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Deadline = mongoose.models.Deadline || mongoose.model('Deadline', DeadlineSchema);

export default Deadline;
