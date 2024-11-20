export interface Project {
    _id: string;  // MongoDB ObjectId is usually represented as a string
    title: string;
    status: 'Available' | 'Unavailable' | 'Archived';
    visibility: 'Private' | 'Public';
    description: string;
    files: string;
    createdAt: string;  // This will be a date string in ISO format
    updatedAt: string;  // This will be a date string in ISO format
  }
  