import { NextRequest, NextResponse } from "next/server";
import Projects from "@/app/models/Projects";
import connectMongo from '../../../lib/mongodb'; 

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await connectMongo();
      const project = await Projects.findById(params.id);
      if (!project) {
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
      }
      return NextResponse.json(project, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Failed to fetch project" }, { status: 500 });
    }
  }
  
  export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await connectMongo()
      const body = await req.json();
      const updatedProject = await Projects.findByIdAndUpdate(params.id, body, { new: true });
      if (!updatedProject) {
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
      }
      return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Failed to update project" }, { status: 500 });
    }
  }
  
  export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      await connectMongo()
      const deletedProject = await Projects.findByIdAndDelete(params.id);
      if (!deletedProject) {
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Failed to delete project" }, { status: 500 });
    }
  }