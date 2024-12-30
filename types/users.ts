export interface User {
    _id: string;
    imageUrl: string;
    name: string;
    email: string;
    course: string;
    description: string;
    role: string;
    approved: boolean;
    assigned: boolean;
    assignedProject?: string;

  }
  