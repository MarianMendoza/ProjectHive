import { User } from "./users";

export interface Project {
    deliverables: any;
    _id: string;  
    title: string;
    status: boolean;
    programme: string;
    visibility: 'Private' | 'Public' | 'Archived';
    projectAssignedTo: {
      supervisorId: User ; 
      secondReaderId: User;
      studentsId: User[];
      authorId: User;
    };
    applicants: {
      studentId: User;
    }[];
    abstract: string;
    description: string;
    createdAt: string;  
    updatedAt: string; 
    expiredAt: string | null; 
  }
  