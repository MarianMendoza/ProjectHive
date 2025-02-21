import formidable from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import User from "@/app/models/User";
import Deliverables from "@/app/models/Deliverables";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const buf = await request.arrayBuffer();
    const buffer = Buffer.from(buf);
    const stream = Readable.from(buffer);
    const headers = Object.fromEntries(request.headers.entries());
    const fakeReq = Object.assign(stream, { headers });

    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      const form = formidable({
        uploadDir: path.join(process.cwd(), "public", "uploads"),
        keepExtensions: true,
      });

      form.parse(fakeReq, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = files.file && Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || !file.filepath || typeof file.filepath !== "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    await connectMongo();

    let destinationFolder: string;
    let fileUrl: string;

    // Handle image uploads
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      destinationFolder = path.join(process.cwd(), "public", "uploads", "profileImages");
      await fs.promises.mkdir(destinationFolder, { recursive: true });

      const newFileName = path.basename(file.filepath);
      const newFilePath = path.join(destinationFolder, newFileName);
      await fs.promises.rename(file.filepath, newFilePath);

      fileUrl = `/uploads/profileImages/${newFileName}`;

      const userId = fields.userId as string;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { pfpurl: fileUrl },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ pfpurl: fileUrl });
    }

    // Handle document uploads (for project deliverables)
    if (file.mimetype && file.mimetype.startsWith("application/")) {

      const projectId = Array.isArray(fields.projectId) ? fields.projectId[0] : fields.projectId;
      const deliverableType = Array.isArray(fields.deliverableType) ? fields.deliverableType[0] : fields.deliverableType;
      const deliverableId = Array.isArray(fields.deliverablesId) ? fields.deliverablesId[0] : fields.deliverablesId;


      // console.log(projectId)
      // Bugs with naming variables!
      // console.log(deliverableType)
      // console.log(deliverableId)

      destinationFolder = path.join(process.cwd(), "public", "uploads", "documents", projectId);
      await fs.promises.mkdir(destinationFolder, { recursive: true });

      const newFileName = path.basename(file.filepath);
      const newFilePath = path.join(destinationFolder, newFileName);
      await fs.promises.rename(file.filepath, newFilePath);

      fileUrl = `/uploads/documents/${projectId}/${newFileName}`;


   
      if (!projectId) {
        return NextResponse.json({ error: "Project Id is required" }, { status: 400 });
      }

      if (!deliverableId) {
        return NextResponse.json({ error: "Deliverables Id is required." }, { status: 400 });
      }

      const validTypes = ["outlineDocument", "extendedAbstract", "finalReport"];
      if (!deliverableType || !validTypes.includes(deliverableType)) {
        return NextResponse.json({ error: "No valid types match" }, { status: 400 });
      }
      


      const updateData: Record<string, any> = {};
      updateData[`${deliverableType}.file`] = fileUrl;
      updateData[`${deliverableType}.uploadedAt`] = new Date();

      const updatedDeliverable = await Deliverables.findByIdAndUpdate(
        { _id: deliverableId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedDeliverable) {
        return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
      }

      return NextResponse.json({ fileUrl });
    }

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process the file upload." }, { status: 500 });
  }
}
