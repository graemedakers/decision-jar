
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiErrorResponse = {
    success: false;
    error: string;
    code?: string;
    details?: any;
    timestamp: string;
};

export type ApiSuccessResponse<T> = {
    success: true;
    data: T;
};

export function apiSuccess<T>(data: T, status = 200) {
    return NextResponse.json(
        { success: true, data } as ApiSuccessResponse<T>,
        { status }
    );
}

export function apiError(message: string, status = 500, code?: string, details?: any) {
    return NextResponse.json(
        {
            success: false,
            error: message,
            code,
            details,
            timestamp: new Date().toISOString()
        } as ApiErrorResponse,
        { status }
    );
}

export function handleApiError(error: any) {
    console.error("API Error:", error);

    if (error instanceof ZodError) {
        return apiError("Validation Failed", 400, "VALIDATION_ERROR", (error as any).errors);
    }

    // Standard Error object
    if (error instanceof Error) {
        // Handle specific error types if needed (e.g. Prisma known errors)
        if (error.message.includes('Prisma')) {
            return apiError("Database Error", 500, "DB_ERROR"); // Hide internal details in prod
        }
        return apiError(error.message, 500, "INTERNAL_ERROR");
    }

    // Fallback
    return apiError("Internal Server Error", 500, "UNKNOWN_ERROR");
}
