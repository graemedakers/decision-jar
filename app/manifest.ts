import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Decision Jar',
        short_name: 'DecisionJar',
        description: 'The Ultimate Decision Maker for groups and couples.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f43f5e',
        icons: [
            {
                src: '/icons/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
