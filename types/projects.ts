export interface Project {
    _id: string;  
    title: string;
    status: 'Available' | 'Unavailable' | 'Archived';
    visibility: 'Private' | 'Public';
    description: string;
    files: string;
    createdAt: string;  
    updatedAt: string;  
  }
  