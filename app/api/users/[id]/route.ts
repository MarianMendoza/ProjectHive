import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/app/models/User";

// GET: Retrieve a user by ID.
export async function GET(req: Request){
    await connectMongo();
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    try{
        const user = await User.findById(id)

        if (!user) {
            return NextResponse.json({message: "User not found"});
        }

        return NextResponse.json({user},{status:200});
    } catch(error){
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Error fetching user."})
    }

}
// DELETE: Delete a user by ID
export async function DELETE(req: Request){
    await connectMongo();

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting User:", error);
        return NextResponse.json({ message: "Error deleting User" }, { status: 500 });
    }
}

// PUT: Update a user by ID
export async function PUT(req: Request) {
    await connectMongo();

    const  id  = req.url.split("/").pop() as string; 
    const { imageUrl, name, email, tag, description, password, role, approved, pfpurl  } = await req.json();

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {imageUrl, name, email, tag, description, password, role, approved, pfpurl },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        

        return NextResponse.json({ message: "User updated successfully", User: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating User:", error);
        return NextResponse.json({ message: "Error updating User" }, { status: 400 });
    }
}

//PATCH to update a user role 
export async function PATCH(req: Request) {
    await connectMongo();

    const id = req.url.split("/").pop() as string;

    const updateFields = await req.json();

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateFields, 
            { new: true, runValidators: true } 
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "User updated successfully", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating User:", error);
        return NextResponse.json({ message: "Error updating User" }, { status: 400 });
    }
}


