import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-response';
import { QuotaManager } from '@/lib/api/quota-manager';
import { ConciergeService } from '@/lib/services/concierge-service';
import { detectIntent } from '@/lib/intent-detection';
import { CONCIERGE_CONFIGS } from '@/lib/concierge-configs';

export async function POST(req: NextRequest) {
    // 1. Authentication & Quota
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Missing or invalid Authorization header' },
            { status: 401 }
        );
    }

    const apiKey = authHeader.split(' ')[1];
    const quotaStatus = await QuotaManager.checkQuota(apiKey);

    if (!quotaStatus.allowed) {
        return NextResponse.json(
            { error: 'Quota Exceeded', message: quotaStatus.reason },
            { status: 403 } // Or 429
        );
    }

    try {
        // 2. Parse Request
        const body = await req.json();
        const { query, location, jarId, options } = body;

        if (!query) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Missing required field: query' },
                { status: 400 }
            );
        }

        // 3. Intent Detection
        const intent = detectIntent(query);
        const toolKey = intent;

        // Find config ID
        const config = CONCIERGE_CONFIGS[toolKey] || CONCIERGE_CONFIGS['CONCIERGE'];
        const resolvedToolKey = CONCIERGE_CONFIGS[toolKey] ? toolKey : 'CONCIERGE';

        // 3a. Topic/Intent Gating Check
        if (quotaStatus.tier && !QuotaManager.validateTopicAccess(quotaStatus.tier, resolvedToolKey)) {
            return NextResponse.json(
                {
                    error: 'Upgrade Required',
                    message: `The topic '${resolvedToolKey}' is only available on paid plans. Upgrade to access full topics.`
                },
                { status: 403 }
            );
        }

        // 4. Execution
        const targetLocation = location || "your area"; // Default

        // Prepare inputs (empty for now, relying on query)
        const inputs = {};

        const serviceResult = await ConciergeService.generateIdeas({
            toolKey: resolvedToolKey,
            configId: config.id,
            inputs,
            targetLocation,
            isPrivate: false, // Default to public for API generated ideas? Valid question.
            extraInstructions: query,
            useMockData: false // TODO: Support mock mode via options?
        });

        // 5. Response Formatting
        const response = {
            intent: 'GENERATE_IDEAS',
            ideas: serviceResult.recommendations.map((rec: any) => ({
                id: rec.id || crypto.randomUUID(), // Ensure ID
                name: rec.name,
                description: rec.description,
                type: rec.type || 'activity',
                details: rec.details,
                typeData: rec.typeData,
                metadata: { // Add metadata from service result if any
                    source: 'ai',
                    topic: resolvedToolKey
                }
            })),
            metadata: {
                topic: resolvedToolKey,
                count: serviceResult.recommendations.length,
                generatedAt: new Date().toISOString()
            }
        };

        // 6. Record Usage
        // Only record if we actually got results? Or always?
        // Usually always for API calls.
        if (quotaStatus.apiKeyId) {
            await QuotaManager.recordUsage(quotaStatus.apiKeyId, 'POST /api/ideas/generate', 1);
        }

        return NextResponse.json(response);

    } catch (error: unknown) {
        return handleApiError(error);
    }
}
