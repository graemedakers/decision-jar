import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Decision Jar',
        short_name: 'DecisionJar',
        description: 'Your AI-powered decision maker for date nights, friend hangs, and family adventures.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f43f5e',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
