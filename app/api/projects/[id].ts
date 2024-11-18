import type { NextApiRequest, NextApiResponse } from 'next';
import Projects from "../../models/Projects"; // adjust if necessary
import connectMongo from "../../../lib/mongodb"; // Adjust the path according to your structure


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  await connectMongo(); // Make sure MongoDB connection is established

  if (req.method === 'GET') {
    // Get a specific project by ID
    try {
      const project = await Projects.findById(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching project', error });
    }
  } else if (req.method === 'PUT') {
    // Update a specific project by ID
    try {
      const updatedProject = await Projects.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedProject) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: 'Error updating project', error });
    }
  } else if (req.method === 'DELETE') {
    // Delete a specific project by ID
    try {
      const deletedProject = await Projects.findByIdAndDelete(id);
      if (!deletedProject) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
