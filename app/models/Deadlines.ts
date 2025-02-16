import mongoose, { Schema, Document } from 'mongoose';

// Define the Deadline schema
const DeadlineSchema = new Schema({
  outlineDocumentDeadline: { type: Date, required: true },
  extendedAbstractDeadline: { type: Date, required: true },
  finalReportDeadline: { type: Date, required: true },
  openDayDate: {type: Date, required: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Interface for Deadline
export interface IDeadline extends Document {
  outlineDocumentDeadline: Date;
  extendedAbstractDeadline: Date;
  finalReportDeadline: Date;
  openDayDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Deadline = mongoose.models.Deadline || mongoose.model('Deadline', DeadlineSchema);

export default Deadline;
