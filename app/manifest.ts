import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Spin the Jar',
        short_name: 'SpinTheJar',
        description: 'The Ultimate Decision Maker for groups and couples.',
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
