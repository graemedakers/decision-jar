import { NextResponse } from 'next/server';
import { APP_URL } from '@/lib/config';

export async function GET() {
    const spec = {
        openapi: '3.0.0',
        info: {
            title: 'Spin the Jar API',
            version: '1.0.0',
            description: 'AI-powered decision making and idea generation API.',
        },
        servers: [
            {
                url: `${APP_URL}/api`,
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'API Key',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
        paths: {
            '/ideas/generate': {
                post: {
                    summary: 'Generate Ideas',
                    description: 'Generate structured ideas based on a natural language query.',
                    operationId: 'generateIdeas',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['query'],
                                    properties: {
                                        query: {
                                            type: 'string',
                                            description: 'Natural language description of what you are looking for.',
                                            example: 'Fun outdoor activities for couples in San Francisco',
                                        },
                                        location: {
                                            type: 'string',
                                            description: 'Location context for the request.',
                                            example: 'San Francisco, CA',
                                        },
                                        amount: {
                                            type: 'integer',
                                            description: 'Number of ideas to generate (Default: 1).',
                                            minimum: 1,
                                            maximum: 5,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Successful generation',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            ideas: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'string' },
                                                        title: { type: 'string' },
                                                        description: { type: 'string' },
                                                        score: { type: 'number' },
                                                    },
                                                },
                                            },
                                            usage: {
                                                type: 'object',
                                                properties: {
                                                    totalTokens: { type: 'integer' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized - Invalid or missing API Key',
                        },
                        '402': {
                            description: 'Payment Required - Quota exceeded',
                        },
                        '429': {
                            description: 'Too Many Requests - Rate limit exceeded',
                        },
                    },
                },
            },
        },
    };

    return NextResponse.json(spec);
}
