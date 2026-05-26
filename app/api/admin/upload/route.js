import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    { folder: "limousine-cars" }, // folder name in Cloudinary
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                )
                .end(buffer);
        });

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        });
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}