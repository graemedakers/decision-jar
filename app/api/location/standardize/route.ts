import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        const { location } = await request.json();

        if (!location || typeof location !== 'string' || location.trim().length < 3) {
            return NextResponse.json({ location });
        }

        // 1. Call OpenStreetMap Nominatim API to standardize
        const params = new URLSearchParams({
            q: location,
            format: 'json',
            addressdetails: '1',
            limit: '1'
        });

        // Use a descriptive User-Agent as required by OSM Nominatim Usage Policy
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
            headers: {
                'User-Agent': 'DecisionJar/1.0 (graemedakers@gmail.com)'
            }
        });

        if (!res.ok) {
            console.error("Nominatim API Error", res.status);
            return NextResponse.json({ location });
        }

        const data = await res.json();
        let formattedLocation = location;

        if (data && data.length > 0) {
            const result = data[0];
            const addr = result.address;

            // Construct a cleaner "City, Region, Country" format if possible, 
            // otherwise fallback to display_name (which can be very verbose)
            const parts = [];

            // Try to find the most specific "place" name
            const place = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || addr.suburb || addr.neighbourhood;

            if (place) {
                parts.push(place);
                // Add state/region/county if available and different from place
                const region = addr.state || addr.county || addr.province;
                if (region && region !== place) parts.push(region);
                // Add country
                if (addr.country) parts.push(addr.country);

                formattedLocation = parts.join(", ");
            } else {
                // Fallback: If we can't parse a neat City structure, simple usage of display_name
                // But display_name can be "Starbucks, 123, Main St, ..."
                // Let's rely on Nominatim's display_name but maybe limit it if user searched for a city?
                // Actually, the user asked for "Unique across worldwide locations". display_name is the safest bet for uniqueness.
                formattedLocation = result.display_name;
            }
        }

        // 2. Update User's Home Location if Authenticated and Changed
        if (session?.user?.id) {
            // Fetch current user to check db state
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { homeTown: true }
            });

            if (user && user.homeTown !== formattedLocation) {
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { homeTown: formattedLocation }
                });
                console.log(`Updated user ${session.user.id} home location to: ${formattedLocation}`);
            }
        }

        return NextResponse.json({
            original: location,
            formatted: formattedLocation
        });

    } catch (error) {
        console.error("Location standardization failed:", error);
        return NextResponse.json({ error: "Standardization failed" }, { status: 500 });
    }
}
