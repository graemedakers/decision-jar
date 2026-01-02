import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        console.log("Starting upload request...");

        // Check for environment variables immediately
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            console.error("Missing Cloudinary environment variables");
            return NextResponse.json({ error: "Server configuration error: Missing Cloudinary credentials" }, { status: 500 });
        }

        // Dynamically import cloudinary
        const { v2: cloudinary } = await import('cloudinary');

        // Sanitize environment variables (remove surrounding quotes if present)
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.replace(/^['"]|['"]$/g, '');
        const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^['"]|['"]$/g, '');
        const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^['"]|['"]$/g, '');

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
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
            return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
        }

        let result: any;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload using a stream
            result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "date-jar/memories",
                        resource_type: "auto",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
        } else if (url) {
            result = await cloudinary.uploader.upload(url, {
                folder: "date-jar/memories",
                resource_type: "auto",
            });
        }

        return NextResponse.json({
            success: true,
            url: result.secure_url
        });

    } catch (error: any) {
        console.error("Upload handler failed:", error);
        // Ensure we return a JSON response even for unexpected errors
        return NextResponse.json({ error: `Upload failed: ${error.message || "Unknown error"}` }, { status: 500 });
    }
}
