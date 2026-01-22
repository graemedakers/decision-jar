import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { parseIntent } from '@/lib/intent-parser';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { prompt, location, jarTopic } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
        }

        const intent = await parseIntent(prompt, {
            location: location || undefined,
            jarTopic: jarTopic || 'General'
        });

        return NextResponse.json({ success: true, intent });
    } catch (error: any) {
        console.error('Intent classification error:', error);
        return NextResponse.json(
            { error: 'Failed to classify intent', details: error.message },
            { status: 500 }
        );
    }
}
