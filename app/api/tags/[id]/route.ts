import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Tag from "@/app/models/Tags";


export async function DELETE(req: Request){
    await connectMongo();

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    console.log(id);

    try {
        const deletedTag = await Tag.findByIdAndDelete(id);
        console.log(deletedTag)
        if (!deletedTag) {
            return NextResponse.json({ message: "Tag not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Tag deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting Tag:", error);
        return NextResponse.json({ message: "Error deleting Tag" }, { status: 500 });
    }
}
