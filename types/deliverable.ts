export interface Deliverable {
  file: string;
  uploadedAt: string;
  deadline: string;
  description?: string;
  supervisorGrade?: number;
  supervisorFeedback?: string;
  secondReaderGrade?: number;
  secondReaderFeedback?: string;
}

export interface IDeliverables {
  projectId: string;
  outlineDocument: Deliverable;
  extendedAbstract: Deliverable;
  finalReport: Deliverable;
  createdAt: string;  
  updatedAt: string;  
}
