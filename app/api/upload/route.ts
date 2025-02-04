// app/api/upload/route.ts

import formidable from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb"; // Adjust the import path to your DB connection
import User from "@/app/models/User";

// Disable Next.js's built-in body parser so formidable can handle the file upload.
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    // 1. Convert the Web Request to a Node.js stream:
    const buf = await request.arrayBuffer();
    const buffer = Buffer.from(buf);
    // Create a Readable stream from the buffer.
    const stream = Readable.from(buffer);
    // Convert the Headers object to a plain object.
    const headers = Object.fromEntries(request.headers.entries());
    // Create a fake "req" that includes the headers.
    const fakeReq = Object.assign(stream, { headers });

    // 2. Wrap formidable's parsing in a promise.
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      const form = formidable({
        // Define the upload directory and keep file extensions.
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

    // Get the file path and create a URL for accessing the file.
    const filePath = file.filepath;
    const fileUrl = `/uploads/${path.basename(filePath)}`;
    const userId = fields.userId as string;

    // 4. Connect to MongoDB and update the user's profile picture URL.
    await connectMongo();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { pfpurl: fileUrl },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 5. Return a successful response.
    return NextResponse.json({ pfpUrl: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process the file upload." },
      { status: 500 }
    );
  }
}
