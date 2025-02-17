import mongoose, { Schema, Document } from 'mongoose';

// Define the Deadline schema
const DeadlineSchema = new Schema({
  outlineDocumentDeadline: { type: Date, required: false },
  extendedAbstractDeadline: { type: Date, required: false },
  finalReportDeadline: { type: Date, required: false },
  openDayDate: {type: Date, required: false},
  pastProjectDate: {type:Date, required: false},
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
