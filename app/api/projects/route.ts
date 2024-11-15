import { NextRequest, NextResponse } from "next/server";
import Projects from "@/app/models/Projects";
import connectMongo from '../../../lib/mongodb'; // Adjust the path according to your structure



export async function GET() {
    try {
    await connectMongo();
    const projects = await Projects.find();
      return NextResponse.json(projects, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Failed to fetch projects" }, { status: 500 });
    }
  }
  
  export async function POST(req: NextRequest) {
    try {
      await connectMongo();
      const body = await req.json();
      const project = await Projects.create(body);
      return NextResponse.json(project, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: "Failed to create project" }, { status: 500 });
    }
  }