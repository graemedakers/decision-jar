import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        logger.info("Starting upload request...");

        // Check for environment variables immediately
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            logger.error("Missing Cloudinary environment variables");
            return NextResponse.json({ error: "Server configuration error: Missing Cloudinary credentials" }, { status: 500 });
        }

        // Dynamically import cloudinary
        const { v2: cloudinary } = await import('cloudinary');

        // FORCE FIX: The Cloudinary SDK reads process.env.CLOUDINARY_URL automatically.
        // If it contains quotes (e.g. 'cloudinary://...'), it will crash even if we pass manual config.
        // We must sanitize the actual environment variable in this process.
        if (process.env.CLOUDINARY_URL) {
            process.env.CLOUDINARY_URL = process.env.CLOUDINARY_URL.replace(/^['"]|['"]$/g, '');
        }

        // Sanitize other variables just in case we use them
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.replace(/^['"]|['"]$/g, '');
        const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^['"]|['"]$/g, '');
        const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^['"]|['"]$/g, '');

        // Configure Cloudinary with sanitized values
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
        logger.error("Upload handler failed:", error);
        // Ensure we return a JSON response even for unexpected errors
        return NextResponse.json({ error: `Upload failed: ${error.message || "Unknown error"}` }, { status: 500 });
    }
}
