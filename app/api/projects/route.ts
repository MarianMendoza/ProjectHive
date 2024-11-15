import { NextApiResponse, NextApiRequest } from "next";
import Projects from "@/app/models/Projects";
import connectMongo from '../../../lib/mongodb'; // Adjust the path according to your structure

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await connectMongo();

    switch (req.method) {
        case "GET":
            try {
                const projects = await Projects.find();
                return res.status(200).json(projects);

            } catch (error) {
                return res.status(500).json({ message: "Failed to fetch projects" });

            }

        case "POST":
            try {
                const project = new Projects(req.body);
                await project.save();
                return res.status(201).json(project);
            } catch (error) {
                return res.status(400).json({ message: "Method not allowed" });

            }

        default: return res.status(405).json({ message: "Method is not allowed" });

    }
};
export default handler;