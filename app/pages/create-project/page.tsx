'use client';
import { useEffect, useState } from 'react';
import { Project } from '../../../types/projects'; // TypeScript interface for the project
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const CreateProjectsPage = () => {
    const [newProject, setNewProject] = useState<Project>({
        title: '',
        description: '',
        status: 'Available',
        visibility: 'Public',
      });

      const handleCreateProject = async () => {
        const response = await fetch('../api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProject),
        });
    
        if (response.ok) {
          const createdProject = await response.json();
          setProjects((prevProjects) => [...prevProjects, createdProject]); // Add the new project to the list
          setModalOpen(false); // Close the modal after successful creation
        } else {
          console.error('Failed to create project');
        }
      };

}