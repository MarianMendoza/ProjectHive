import { User } from "./users";

export interface Project {
    _id: string;  
    title: string;
    status: boolean;
    visibility: 'Private' | 'Public' | 'Archived';
    projectAssignedTo: {
      supervisorId: User ; 
      secondReaderId: User;
      studentsId: User[];
      authorId: User;
    };
    description: string;
    files: string;
    createdAt: string;  
    updatedAt: string; 
    expiredAt: string | null; 
  }
  