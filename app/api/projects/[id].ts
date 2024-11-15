import { NextApiResponse, NextApiRequest } from "next";
import Projects from "@/app/models/Projects";
import connectMongo from '../../../lib/mongodb'; 
import { connect } from "http2";

const handler = async (req: NextApiRequest, res:NextApiResponse) => {
    const {id} = req.query;
    if (!id || typeof id !== "string"){
        return res.status(400).json({message: "Invalid project ID"});
    }
    await connectMongo();

    switch (req.method) {
        case "GET":
            try {
                const project = await Projects.findById(id);
                if (!project) return res.status(404).json({message: "Project not found"});
                return res.status(200).json(project);

            } catch (error) {
                return res.status(500).json({ message: "Failed to fetch projects" });

            }

        case "PUT":
            try {
                const project = await Projects.findByIdAndUpdate(id, req.body, {new: true});
                if (!project) return res.status(404).json({message: "Project not found"});
                return res.status(202).json(project);
            } catch (error) {
                return res.status(400).json({ message: "Failed to update project" });

            }

        case "DELETE":
            try {
                const project = await Projects.findByIdAndDelete(id);
                if (!project) return res.status(404).json({message: "Project not found"});
                return res.status(200).json({message: "Project deleted successfully"});
            } catch (error) {
                return res.status(500).json({message: "Failed to delete project"});
                
            }

        default: return res.status(405).json({ message: "Method is not allowed" });

    }

};

export default handler;