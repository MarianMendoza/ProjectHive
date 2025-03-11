import mongoose, { Document } from 'mongoose';

export interface Deliverable {
  projectAssignedTo: any;
  file: string | null;
  uploadedAt: Date | null;
  supervisorGrade?: number | null;
  supervisorFeedback?: Map<string, string>;
  isPublished?: boolean;
}

export interface FinalReport {
  uploadedAt: Date | null;
  supervisorInitialGrade?: number | null;
  supervisorInitialFeedback?: Map<string, string>;
  secondReaderInitialGrade?: number | null;
  secondReaderInitialFeedback?: Map<string, string>;
  supervisorGrade?: number | null;
  supervisorFeedback?: Map<string, string>;
  supervisorInitialSubmit?: boolean;
  secondReaderInitialSubmit?: boolean;
  secondReaderSigned?: boolean;
  supervisorSigned?: boolean;
  supervisorSubmit?: boolean;
  isPublished?: boolean;
}

export interface IDeliverables extends Document {
  projectId: mongoose.Types.ObjectId;
  outlineDocument: Deliverable;
  extendedAbstract: Deliverable;
  finalReport: FinalReport;
  createdAt: Date;
  updatedAt: Date;
}
