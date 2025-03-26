import mongoose, { Document, Schema } from 'mongoose';

// Deliverable schema definition for the outline document and the extended document.
const DeliverableSchema = new Schema({
  file: { type: String, default: null },
  uploadedAt: { type: Date, default: null },
  supervisorGrade: { type: Number, default: null },
  supervisorFeedback: {
    type: Map,
    of: String,
    default:
    {
      "Analysis": "",
      "Design": "",
      "Implementation": "",
      "Writing": "",
      "Evaluation": "",
      "Overall Achievement": "",
    }
  },
  isPublished: { type: Boolean, default: false }
});

const finalReportSchema = new Schema({
  file: { type: String, default: null },
  deadlineId: { type: String, default: null },
  uploadedAt: { type: Date, default: null },
  supervisorInitialGrade: { type: Number, default: null },
  supervisorInitialFeedback: {
    type: Map,
    of: String,
    default:
    {
      "Analysis": "",
      "Design": "",
      "Implementation": "",
      "Writing": "",
      "Evaluation": "",
      "Overall Achievement": "",
    }
  },
  secondReaderInitialGrade: { type: Number, default: null },
  secondReaderInitialFeedback: {
    type: Map,
    of: String,
    default:
    {
      "Analysis": "",
      "Design": "",
      "Implementation": "",
      "Writing": "",
      "Evaluation": "",
      "Overall Achievement": "",
    }
  },
  supervisorGrade: { type: Number, default: null },
  supervisorFeedback: {
    type: Map,
    of: String,
    default:
    {
      "Analysis": "",
      "Design": "",
      "Implementation": "",
      "Writing": "",
      "Evaluation": "",
      "Overall Achievement": "",
    }
  },
  supervisorInitialSubmit: { type: Boolean, default: false },
  secondReaderInitialSubmit: { type: Boolean, default: false },
  secondReaderSigned: {type: Boolean, default: false},
  supervisorSigned: {type: Boolean, default: false},
  isPublished: { type: Boolean, default: false },
})

export interface IDeliverables extends Document {
  _id: String;
  projectId: mongoose.Types.ObjectId;
  outlineDocument: typeof DeliverableSchema;
  extendedAbstract: typeof DeliverableSchema;
  finalReport: typeof finalReportSchema;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Deliverables schema
const DeliverablesSchema: Schema = new Schema({
  projectId: { type: mongoose.Types.ObjectId, ref: 'Projects', required: true },
  outlineDocument: DeliverableSchema,
  extendedAbstract: DeliverableSchema,
  finalReport: finalReportSchema,
  deadlineId: { type: mongoose.Types.ObjectId, ref: 'Deadline', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Deliverables = mongoose.models.Deliverables || mongoose.model('Deliverables', DeliverablesSchema);

export default Deliverables;
