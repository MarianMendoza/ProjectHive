import mongoose, { Document, Schema } from 'mongoose';

// Deliverable schema definition
const DeliverableSchema = new Schema({
  deadlineId: {type: String, default: null},
  file: { type: String, default: null },
  uploadedAt: { type: Date, default: null },
  supervisorGrade: { type: Number, default: null },
  supervisorFeedback: { type: String, default: null },
  secondReaderGrade: { type: Number, default: null },
  secondReaderFeedback: { type: String, default: null },
  isPublished: {type: Boolean , default: false}
});

export interface IDeliverables extends Document {
  projectId: mongoose.Types.ObjectId;
  outlineDocument: typeof DeliverableSchema;
  extendedAbstract: typeof DeliverableSchema;
  finalReport: typeof DeliverableSchema;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Deliverables schema
const DeliverablesSchema: Schema = new Schema({
  projectId: { type: mongoose.Types.ObjectId, ref: 'Projects', required: true },
  outlineDocument: DeliverableSchema,
  extendedAbstract: DeliverableSchema,
  finalReport: DeliverableSchema,
  deadlineId: { type: mongoose.Types.ObjectId, ref: 'Deadline', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Deliverables = mongoose.models.Deliverables || mongoose.model('Deliverables', DeliverablesSchema);

export default Deliverables;
