export interface Deliverable {
  file: string;
  uploadedAt: string;
  description?: string;
  supervisorGrade?: number;
  supervisorFeedback?: string;
  secondReaderGrade?: number;
  secondReaderFeedback?: string;
  isPublished?: boolean;
}

export interface IDeliverables {
  id: string;
  projectId: string;
  outlineDocument: Deliverable;
  extendedAbstract: Deliverable;
  finalReport: Deliverable;
  createdAt: string;  
  updatedAt: string;  
}
