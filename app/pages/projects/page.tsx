'use client';

import { useState, useEffect } from 'react';

interface Project {
  _id: string;
  title: string;
  status: string;
  visibility: string;
  description: string;
  files: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Available');
  const [visibility, setVisibility] = useState('Private');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState('');
  
  useEffect(() => {
    // Fetch all projects
    const fetchProjects = async () => {
      const response = await fetch('../api/projects');
      const data = await response.json();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    const newProject = { title, status, visibility, description, files };
    const response = await fetch('../api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProject),
    });
    const data = await response.json();
    setProjects([...projects, data]);
    // Reset fields after create
    setTitle('');
    setStatus('Available');
    setVisibility('Private');
    setDescription('');
    setFiles('');
  };

  const handleDeleteProject = async (id: string) => {
    await fetch(`../api/projects/${id}`, {
      method: 'DELETE',
    });
    setProjects(projects.filter(project => project._id !== id));
  };

  const handleEditProject = async (id: string) => {
    const updatedProject = { ...projects.find(p => p._id === id), status: 'Archived' }; // Example update
    const response = await fetch(`../api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProject),
    });
    const data = await response.json();
    setProjects(projects.map(p => p._id === id ? data : p));
  };

  return (
    <div>
      <h1>Projects</h1>
      
      {/* Form to create project */}
      <div>
        <input 
          type="text" 
          placeholder="Project Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Files"
          value={files}
          onChange={(e) => setFiles(e.target.value)}
        />
        <button onClick={handleCreateProject}>Create Project</button>
      </div>

      {/* List of projects */}
      <div>
        {projects.map(project => (
          <div key={project._id} className="card">
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            <p>Status: {project.status}</p>
            <p>Visibility: {project.visibility}</p>
            <button onClick={() => handleEditProject(project._id)}>Edit</button>
            <button onClick={() => handleDeleteProject(project._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
