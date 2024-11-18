import type { NextApiRequest, NextApiResponse } from 'next';
import Projects from "../../models/Projects"; // adjust if necessary
import connectMongo from "../../../lib/mongodb"; // Adjust the path according to your structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo(); // Make sure MongoDB connection is established

  if (req.method === 'GET') {
    // Get all projects
    try {
      const projects = await Projects.find({});
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects', error });
    }
  } else if (req.method === 'POST') {
    // Create a new project
    try {
      const newProject = new Projects(req.body);
      await newProject.save();
      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ message: 'Error creating project', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
