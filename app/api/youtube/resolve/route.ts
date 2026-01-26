import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    try {
        // We use the YouTube search results page and extract the first video ID
        // This is a lightweight way to get the top result without an API key
        const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch search results' }, { status: response.status });
        }

        const html = await response.text();

        // Match the first videoId in the page source (ytInitialData or raw HTML)
        const videoIdMatch = html.match(/"videoId":"([^"]{11})"/);

        if (videoIdMatch && videoIdMatch[1]) {
            const videoId = videoIdMatch[1];

            // Also try to get a thumbnail/title from oembed now that we have an ID
            const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            let metadata = {};
            if (oembedRes.ok) {
                const data = await oembedRes.json();
                metadata = {
                    title: data.title,
                    authorName: data.author_name,
                    thumbnailUrl: data.thumbnail_url
                };
            }

            return NextResponse.json({
                videoId,
                ...metadata
            });
        }

        return NextResponse.json({ error: 'No video found' }, { status: 404 });
    } catch (error: any) {
        console.error('YouTube resolution error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
