import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Decision Jar',
        short_name: 'Decision Jar',
        description: 'A fun, interactive way to make decisions.',
        start_url: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#2563eb',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
