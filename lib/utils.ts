import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function generateUniqueCode(length = 6): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Generates a unique jar reference code with database verification
 * Retries up to maxAttempts times if collisions occur
 * @param length - Length of the code (default: 6)
 * @param maxAttempts - Maximum retry attempts (default: 10)
 * @returns A guaranteed unique reference code
 * @throws Error if unable to generate unique code after maxAttempts
 */
export async function generateUniqueJarCode(length = 6, maxAttempts = 10): Promise<string> {
    const { prisma } = await import('./prisma');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = await generateUniqueCode(length);

        // Check if code already exists
        const existing = await prisma.jar.findUnique({
            where: { referenceCode: code },
            select: { id: true }
        });

        if (!existing) {
            return code;
        }

        // Log collision for monitoring
        console.warn(`Jar code collision detected: ${code} (attempt ${attempt + 1}/${maxAttempts})`);
    }

    throw new Error(`Failed to generate unique jar code after ${maxAttempts} attempts`);
}

function safeParseJSON(input: string | any) {
    if (typeof input !== 'string') return input;

    // 1. Try direct parse
    try {
        return JSON.parse(input);
    } catch (e) { }

    // 2. Try parsing string as JSON (double stringified)
    try {
        const parsed = JSON.parse(input);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
        if (typeof parsed === 'string') {
            try { return JSON.parse(parsed); } catch (e) { }
        }
    } catch (e) { }

    // 3. Try stripping Markdown code blocks
    const markdownMatch = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
        try { return JSON.parse(markdownMatch[1]); } catch (e) { }
    }

    // 4. Try extracting simple object
    const firstOpen = input.indexOf('{');
    const lastClose = input.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        try {
            return JSON.parse(input.substring(firstOpen, lastClose + 1));
        } catch (e) { }
    }

    return null;
}

export function getItinerary(details?: string | null) {
    if (!details) return null;
    const data = safeParseJSON(details);

    if (data && typeof data === 'object' && Array.isArray(data.schedule)) {
        return data;
    }
    return null;
}

export function getCateringPlan(details?: string | null) {
    if (!details) return null;
    const data = safeParseJSON(details);

    if (data && typeof data === 'object' && (Array.isArray((data as any).courses) || Array.isArray((data as any).options))) {
        return data;
    }
    return null;
}

/**
 * Enhances the extraction of hours by taking a representative snippet (e.g., today's or a summary).
 * Truncates long multi-day strings for card display.
 */
export function getShortHours(hours?: string | null): string | null {
    if (!hours) return null;

    // If it's a simple range "9am - 5pm", return it
    if (hours.length < 20) return hours;

    // If it's a multi-line or comma-separated list like "Mon: 9-5, Tue: 9-5..."
    // try to find today's day or just take the first part
    const parts = hours.split(/[,|\n]/);
    if (parts.length > 1) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayIdx = new Date().getDay();
        const todayName = days[todayIdx];

        const todayMatch = parts.find(p => p.includes(todayName));
        if (todayMatch) return todayMatch.trim();

        return parts[0].trim();
    }

    // Fallback: truncate
    return hours.substring(0, 25) + (hours.length > 25 ? '...' : '');
}

export function getVenueDetails(details?: string | null) {
    if (!details) return null;

    // Detect if this looks like a venue info block
    const hasAddress = details.includes('**Address:**') || details.includes('Address:');
    const hasRating = details.includes('**Rating:**') || details.includes('Rating:');
    const hasHours = details.includes('**Hours:**') || details.includes('Hours:');

    if (!hasAddress && !hasRating && !hasHours) return null;

    const extract = (key: string) => {
        // Match bold or plain keys, then capture until newline
        const regex = new RegExp(`(?:\\*\\*)?${key}:?(?:\\*\\*)?\\*?\\s*(.*)`, 'i');
        const match = details.match(regex);
        if (match) {
            let val = match[1].trim();
            // Remove trailing markdown bolding if present
            val = val.replace(/\*\*$/, '').trim();
            // Remove any leftover leading/trailing asterisks
            val = val.replace(/^\*+/, '').replace(/\*+$/, '').trim();
            return val || null;
        }
        return null;
    };

    const address = extract('Address');
    const rating = extract('Rating');
    const hours = extract('Hours');
    const description = extract('Description') || extract('Summary') || extract('Note');

    let website = extract('Website');
    if (website) {
        // Handle markdown link format: [Text](URL)
        const mdLinkMatch = website.match(/\[.*?\]\((https?:\/\/[^\s)]+)\)/);
        if (mdLinkMatch) {
            website = mdLinkMatch[1];
        }
    }

    // Fallback to searching context if not found on explicit line
    if (!website) {
        website = details.match(/https?:\/\/[^\s]+/)?.[0] || null;
    }

    if (!address && !rating && !website && !hours) return null;

    return {
        address,
        rating,
        hours,
        website,
        description
    };
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
                    // Use zoom 18 for max precision (building/road level)
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await res.json();

                    if (data.address) {
                        const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential || "";
                        const city = data.address.city || data.address.town || data.address.village || "";
                        const state = data.address.state || data.address.country || "";

                        let locationParts = [];
                        if (suburb) locationParts.push(suburb);
                        if (city) locationParts.push(city);
                        if (!suburb && !city && state) locationParts.push(state);

                        if (locationParts.length > 0) {
                            resolve(locationParts.join(", "));
                        } else {
                            resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        }
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

export interface CalendarEvent {
    title: string;
    description?: string;
    location?: string;
    startTime?: Date;
    endTime?: Date;
}

export function generateCalendarLinks(event: CalendarEvent) {
    const { title, description = '', location = '', startTime = new Date(), endTime } = event;
    const start = startTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
    // Default 1 hour if no end time
    const end = (endTime || new Date(startTime.getTime() + 60 * 60 * 1000)).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const details = encodeURIComponent(description);
    const text = encodeURIComponent(title);
    const loc = encodeURIComponent(location);

    const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${loc}`;
    const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${startTime.toISOString()}&enddt=${(endTime || new Date(startTime.getTime() + 60 * 60 * 1000)).toISOString()}&subject=${text}&body=${details}&location=${loc}`;
    const apple = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0AURL:${typeof document !== 'undefined' ? document.location.href : ''}%0ADTSTART:${start}%0ADTEND:${end}%0ASUMMARY:${text}%0ADESCRIPTION:${details}%0ALOCATION:${loc}%0AEND:VEVENT%0AEND:VCALENDAR`;

    return { google, outlook, apple };
}
