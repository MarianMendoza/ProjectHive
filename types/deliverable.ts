export interface Deliverable {
    file: string;
    uploadedAt: string;
    deadline: string;
    description?: string;
    supervisorGrade?: string; 
    supervisorFeedback?: string;
    secondReaderGrade?: string; 
    secondReaderFeedback?: string;
  }