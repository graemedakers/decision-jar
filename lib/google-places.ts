
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

interface PlaceResult {
    name: string;
    formatted_address: string;
    place_id: string;
    rating?: number;
    user_ratings_total?: number;
    photos?: any[];
}

interface PlaceDetails {
    website?: string;
    url?: string; // Google Maps URL
    formatted_phone_number?: string;
    opening_hours?: any;
    price_level?: number;
}

export async function searchPlace(query: string): Promise<PlaceResult | null> {
    if (!API_KEY) return null;

    try {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            return data.results[0] as PlaceResult;
        }
        console.warn(`[GooglePlaces] Search failed for "${query}": ${data.status}`);
        return null;
    } catch (error) {
        console.error(`[GooglePlaces] Search error for "${query}":`, error);
        return null;
    }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!API_KEY) return null;

    try {
        // Request specific fields to save data/latency (Legacy API standard fields)
        const fields = 'name,website,url,formatted_address,rating';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.result) {
            return data.result as PlaceDetails;
        }
        console.warn(`[GooglePlaces] Details failed for "${placeId}": ${data.status}`);
        return null;
    } catch (error) {
        console.error(`[GooglePlaces] Details error for "${placeId}":`, error);
        return null;
    }
}

/**
 * Orchestrates Search + Details to find the best URL.
 */
export async function findPlaceUrl(query: string): Promise<{ website?: string; googleMapsUrl?: string; placeId?: string; rating?: number; address?: string } | null> {
    const place = await searchPlace(query);
    if (!place) return null;

    const details = await getPlaceDetails(place.place_id);

    return {
        website: details?.website,
        googleMapsUrl: details?.url,
        placeId: place.place_id,
        rating: place.rating,
        address: place.formatted_address,
    };
}
