import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'Spin the Jar - The Ultimate Decision Maker';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: 'linear-gradient(to bottom right, #0f172a, #331535)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {/* Heart Icon SVG */}
                    <svg
                        width="100"
                        height="100"
                        viewBox="0 0 24 24"
                        fill="#ec4899"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <span style={{ fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #94a3b8)', backgroundClip: 'text', color: 'transparent' }}>Spin the Jar</span>
                </div>
                <div style={{ fontSize: 40, marginTop: 40, color: '#fda4af' }}>
                    Never ask "What should we do?" again.
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
