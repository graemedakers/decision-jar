'use server';

import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Dynamic import of cloudinary to avoid build issues if it's not used everywhere
// but in a server action file it's fine.
import { v2 as cloudinary } from 'cloudinary';

export type UploadResponse = {
    success: boolean;
    url?: string;
    error?: string;
};

// Configure Cloudinary
function configureCloudinary() {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Missing Cloudinary credentials");
    }

    // Sanitize env if needed (copied from route logic)
    if (process.env.CLOUDINARY_URL) {
        process.env.CLOUDINARY_URL = process.env.CLOUDINARY_URL.replace(/^['"]|['"]$/g, '');
    }
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.replace(/^['"]|['"]$/g, '');
    const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^['"]|['"]$/g, '');
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^['"]|['"]$/g, '');

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });
}

export async function uploadImage(formData: FormData): Promise<UploadResponse> {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        configureCloudinary();

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result: any = await new Promise((resolve, reject) => {
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

        return { success: true, url: result.secure_url };
    } catch (error: any) {
        logger.error('Upload action failed:', error);
        return { success: false, error: error.message || 'Upload failed' };
    }
}

export async function uploadFromUrl(url: string): Promise<UploadResponse> {
    try {
        if (!url) {
            return { success: false, error: 'No URL provided' };
        }

        configureCloudinary();

        const result = await cloudinary.uploader.upload(url, {
            folder: "date-jar/memories",
            resource_type: "auto",
        });

        return { success: true, url: result.secure_url };
    } catch (error: any) {
        logger.error('Upload URL action failed:', error);
        return { success: false, error: error.message || 'Upload failed' };
    }
}
