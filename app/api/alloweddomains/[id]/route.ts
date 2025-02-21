import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import { AllowedDomain } from "@/app/models/AllowedDomains";

export async function DELETE(req: Request){
    await connectMongo();

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    try {
        const deletedDomain = await AllowedDomain.findByIdAndDelete(id);

        if (!deletedDomain) {
            return NextResponse.json({ message: "Domain not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Domain deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting Domain:", error);
        return NextResponse.json({ message: "Error deleting Domain" }, { status: 500 });
    }
}

