import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    // Dynamically import cloudinary to prevent build-time evaluation of env variables
    const { v2: cloudinary } = await import('cloudinary');

    // Configure Cloudinary inside the handler
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    let file: File | null = null;
    let url: string | null = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
        const data = await request.formData();
        file = data.get('file') as File;
    } else if (contentType.includes("application/json")) {
        const json = await request.json();
        url = json.url;
    }

    if (!file && !url) {
        return NextResponse.json({ error: "No file or URL uploaded" }, { status: 400 });
    }

    // Check configuration
    if (!process.env.CLOUDINARY_API_KEY) {
        return NextResponse.json({ error: "Cloudinary keys missing in .env" }, { status: 500 });
    }

    try {
        let result: any;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload using a stream (efficient for handling file buffers)
            result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "date-jar/memories", // Keeps your Cloudinary bucket organized
                        resource_type: "auto",      // Auto-detect image type
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });
        } else if (url) {
            // Upload via URL
            result = await cloudinary.uploader.upload(url, {
                folder: "date-jar/memories",
                resource_type: "auto",
            });
        }

        // Return the secure (https) url to display
        return NextResponse.json({
            success: true,
            url: result.secure_url
        });

    } catch (error: any) {
        console.error("Cloudinary upload failed:", error);
        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}
