import formidable from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import User from "@/app/models/User";

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

    // 3. Validate the file upload.
    const file =
      files.file && Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    let destinationFolder: string;
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      destinationFolder = path.join(process.cwd(), "public", "uploads", "profileImages");
    } else {
      destinationFolder = path.join(process.cwd(), "public", "uploads", "documents");
    }

    await fs.promises.mkdir(destinationFolder, { recursive: true });

    const newFilePath = path.join(destinationFolder, path.basename(file.filepath));
    await fs.promises.rename(file.filepath, newFilePath);

    let fileUrl: string;
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      fileUrl = `/uploads/profileImages/${path.basename(newFilePath)}`;
    } else {
      fileUrl = `/uploads/documents/${path.basename(newFilePath)}`;
    }

    const userId = fields.userId as string;

    await connectMongo();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { pfpurl: fileUrl }, // Update according to your schema and requirements
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ pfpUrl: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process the file upload." },
      { status: 500 }
    );
  }
}
