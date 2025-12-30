import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getItinerary(details?: string | null) {
    if (!details) return null;
    try {
        let data = JSON.parse(details);
        // Handle potential double-stringification
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { }
        }
        // Check for schedule array
        if (data && typeof data === 'object' && Array.isArray(data.schedule)) return data;
    } catch (e) { return null; }
    return null;
}

export function getApiUrl(path: string) {
    if (path.startsWith('http')) return path;

    // If running on client side, use relative path to ensure we hit the same origin
    if (typeof window !== 'undefined') {
        return path.startsWith('/') ? path : `/${path}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
}

export function isCapacitor() {
    if (typeof window !== 'undefined') {
        return (window as any).Capacitor?.isNativePlatform();
    }
    return false;
}

export async function getCurrentLocation(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Use OpenStreetMap Nominatim for free reverse geocoding
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
                    const data = await res.json();

                    if (data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
                        const state = data.address.state || data.address.country || "";
                        if (city && state) resolve(`${city}, ${state}`);
                        else if (city || state) resolve(city || state);
                        else resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    } else {
                        resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                } catch (error) {
                    // Fallback to coordinates
                    resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                }
            },
            (error) => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}
