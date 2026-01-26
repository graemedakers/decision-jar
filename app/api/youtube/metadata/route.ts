import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
        return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
        const response = await fetch(oembedUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: response.status });
        }

        const data = await response.json();

        return NextResponse.json({
            title: data.title,
            authorName: data.author_name,
            thumbnailUrl: data.thumbnail_url,
            providerName: data.provider_name
        });
    } catch (error: any) {
        console.error('YouTube metadata fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
