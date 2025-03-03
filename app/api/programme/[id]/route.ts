import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Programme from "@/app/models/Programmes";

export async function DELETE(req: Request){
    await connectMongo();

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    console.log(id);

    try {
        const deletedProgramme = await Programme.findByIdAndDelete(id);
        if (!deletedProgramme) {
            return NextResponse.json({ message: "Programme not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Programme deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting Programme:", error);
        return NextResponse.json({ message: "Error deleting Tag" }, { status: 500 });
    }
}
