export interface Project {
    _id: string;  
    title: string;
    status: 'Available' | 'Unavailable' | 'Archived';
    visibility: 'Private' | 'Public';
    projectAssignedTo: {
      supervisorId: string | null,
      secondReaderId: string | null,
      studentsId: string[];
      authorId: string | null;
    };
    description: string;
    files: string;
    createdAt: string;  
    updatedAt: string; 
    expiredAt: string | null; 
  }
  