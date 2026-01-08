
export type PromptGeneratorResponse = {
    prompt: string;
    mockResponse: { recommendations: any[] };
};

export const getConciergePromptAndMock = (
    toolKey: string,
    inputs: Record<string, any>,
    targetLocation: string,
    extraInstructions: string
): PromptGeneratorResponse => {
    switch (toolKey) {
        case 'DINING':
            return {
                prompt: `
                Act as a local dining concierge.
                Recommend 5 distinct restaurants located near ${targetLocation}.
                Focus on venues as close as possible to this area based on the following preferences:
                - Cuisine: ${inputs.cuisine || "Any good local food"}
                - Vibe/Atmosphere: ${inputs.vibe || "Any"}
                - Price Range: ${inputs.price || "Any"}
                
                ${extraInstructions}
                
                IMPORTANT: Perform a check to ensure the restaurant is currently OPEN for business and has NOT permanently closed.
                
                For each restaurant, provide:
                - Name
                - A brief, appetizing description (1 sentence)
                - Cuisine type
                - Price range ($, $$, $$$)
                - Approximate address or neighborhood
                - A likely website URL (or a Google Search URL if specific site unknown)
                - Typical opening hours for dinner (e.g. "5pm - 10pm")
                - Approximate Google Rating (e.g. 4.5)
                
                Return JSON object with "recommendations" array.
                Fields: name, description, cuisine, price, address, website, opening_hours, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "The Rustic Spoon", description: "Farm-to-table dining with a seasonal menu.", cuisine: "Modern American", price: "$$", address: "Market St", google_rating: 4.6 },
                        { name: "Bella Italia", description: "Authentic handmade pasta.", cuisine: "Italian", price: "$$", address: "Little Italy", google_rating: 4.5 },
                        { name: "Spice Route", description: "Aromatic curries.", cuisine: "Indian", price: "$$", address: "Central Ave", google_rating: 4.4 }
                    ]
                }
            };

        case 'BAR':
            return {
                prompt: `
                Act as a local nightlife concierge.
                Recommend 5 distinct bars or drink spots near ${targetLocation}.
                - Drinks Preference: ${inputs.drinks || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ${extraInstructions}
                
                Ensure they are real, currently open businesses with accurate physical addresses.
                Return JSON with "recommendations" array.
                Fields: name, description, speciality (e.g. Cocktails, Beer), price, address, website, opening_hours, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "The Mockingbird", description: "Lively atmosphere.", speciality: "Cocktails", price: "$$$", address: "Oak Ave", google_rating: 4.7 },
                        { name: "Hops & Dreams", description: "Local brews.", speciality: "Beer", price: "$", address: "Main St", google_rating: 4.5 },
                        { name: "Vino Valley", description: "Elegant wine bar.", speciality: "Wine", price: "$$$", address: "River Walk", google_rating: 4.8 }
                    ]
                }
            };

        case 'HOTEL':
            return {
                prompt: `
                Act as a travel concierge for ${targetLocation}.
                Recommend 5 distinct hotels/stays:
                - Style: ${inputs.style || "Any"}
                - Must-Have Amenities: ${inputs.amenities || "Any"}
                - Budget: ${inputs.price || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name, description, speciality (style/vibe), price, address, website, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Grand Hotel Mock", description: "Luxury stay.", speciality: "Luxury", price: "$$$", address: "Grand Ave", google_rating: 4.7 },
                        { name: "Boutique Inn", description: "Charming and cozy.", speciality: "Boutique", price: "$$", address: "Main St", google_rating: 4.5 }
                    ]
                }
            };

        case 'NIGHTCLUB':
            return {
                prompt: `
                Act as a nightlife promoter for ${targetLocation}.
                Recommend 5 distinct clubs/parties:
                - Music: ${inputs.music || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name, description, music (genre), price, address, website, opening_hours, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Club Neon", description: "High energy dance floor.", music: "EDM", price: "$$$", address: "Club District", google_rating: 4.3 },
                        { name: "The Lounge", description: "Chill vibes and R&B.", music: "R&B", price: "$$", address: "Downtown", google_rating: 4.5 }
                    ]
                }
            };

        case 'MOVIE':
            // Movie is special: Logic for Streaming vs Cinema
            const isCinema = inputs.watchMode === 'Cinema';
            return {
                prompt: `
                Act as a movie critic and high-precision local cinema scout.
                Recommend 5 distinct movies based on the following:
                - Watch Mode: ${inputs.watchMode}
                ${isCinema ? `IMPORTANT: Only recommend movies that are CURRENTLY SHOWING in physical cinemas near ${targetLocation}. 
                
                1. 📍 IDENTIFY LOCAL CINEMAS:
                   Find real cinemas currently operating within the same suburb or within 10km of ${targetLocation}.
                
                2. 🔍 BRAND VERIFICATION (CRITICAL):
                   You MUST distinguish between cinema chains correctly. Common hallucinations to avoid:
                   - ROUSE HILL (NSW) -> 'Reading Cinemas' (Rouse Hill Town Centre). NOT Hoyts.
                   - EPPING (VIC) -> 'Reading Cinemas' (Pacific Epping). NOT Hoyts.
                   - GENERIC: Do NOT default to 'Hoyts' or 'Event Cinemas'. Only use them if you have positively verified they operate in the target suburb.
                
                3. 🚫 ZERO HALLUCINATION POLICY:
                   - Do NOT guess the chain. 
                   - If the user is in Rouse Hill or Epping, the ticket URL must lead to ReadingCinemas.com.au.
                
                4. 🔗 URL KNOWLEDGE BASE (STRICT ENFORCEMENT):
                   Use these EXACT patterns for ticket links. Do NOT invent your own paths like '/sessions/'.
                   - Village Cinemas: "https://villagecinemas.com.au/cinemas/[SLUG]?tab=sessions" (e.g. .../cinemas/karingal?tab=sessions)
                   - Reading Cinemas: "https://readingcinemas.com.au/cinemas/[SLUG]" (e.g. .../cinemas/rouse-hill)
                   - Hoyts: "https://www.hoyts.com.au/cinemas/[SLUG]" (e.g. .../cinemas/broadway)
                   - Event Cinemas: "https://www.eventcinemas.com.au/Cinema/[SLUG]" (e.g. .../Cinema/George-Street)
                
                5. 🎟️ DETAILS:
                   - Check for movies playing today or tomorrow.
                   - Provide the specific CINEMA NAME (including branch).
                   - Provide the FULL PHYSICAL ADDRESS.
                   - Provide the OFFICIAL TICKET URL using the patterns above.` : ''}
                - Genre: ${inputs.genre || "Any"}
                - Mood: ${inputs.mood || "Any"}
                - Era: ${inputs.era || "Any"}
                ${!isCinema && inputs.streamingServices ? `- Streaming on: ${inputs.streamingServices}` : ''}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name (Title), description (Plot summary), year, rating (IMDb/Rotten Tomatoes score as string), genre, director, cast
                ${isCinema ? 'Also include: cinema_name, address (Physical address), website (Specific ticket/booking link for this cinema), showtimes (today/tomorrow)' : 'Also include: streaming_service, website (Link to watch)'}
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Mockingbird Lane", description: "A gripping thriller.", year: "2024", rating: "92%", genre: "Thriller", streaming_service: "Netflix", website: "https://netflix.com" },
                        { name: "Laugh Track", description: "Hilarious comedy.", year: "2023", rating: "88%", genre: "Comedy", streaming_service: "Hulu", website: "https://hulu.com" }
                    ]
                }
            };

        case 'BOOK':
            return {
                prompt: `
                Act as a literary curator.
                Recommend 5 distinct books:
                - Genre: ${inputs.genre || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Length: ${inputs.length || "Any"}
                - Era: ${inputs.era || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name (Title), description (Plot), author, year, genre, page_count (approx)
                `,
                mockResponse: {
                    recommendations: [
                        { name: "The Silent Mock", description: "A mystery thriller.", author: "Jane Doe", year: "2023", genre: "Mystery", page_count: "320" },
                        { name: "Future Past", description: "Sci-fi epic.", author: "John Smith", year: "2024", genre: "Sci-Fi", page_count: "450" }
                    ]
                }
            };

        case 'WELLNESS':
            return {
                prompt: `
                Act as a wellness concierge.
                Recommend 5 distinct spas/studios near ${targetLocation}.
                Prioritize venues as close as possible to this area:
                - Activity: ${inputs.activity || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name, description, type (activity type), price, address, website, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Zen Garden Spa", description: "Relaxing massage therapy.", type: "Massage", price: "$$", address: "Green St", google_rating: 4.8 },
                        { name: "Flow Yoga", description: "Peaceful studio.", type: "Yoga", price: "$", address: "Main St", google_rating: 4.9 }
                    ]
                }
            };

        case 'FITNESS':
            return {
                prompt: `
                Act as a fitness guide.
                Recommend 5 distinct gyms or fitness activities near ${targetLocation}.
                Prioritize options within easy reach of this area:
                - Activity: ${inputs.activity || "Any"}
                - Level: ${inputs.level || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name, description, activity_type, price, address, website, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Iron Gym", description: "Old school bodybuilding.", activity_type: "Gym", price: "$", address: "Muscle Ave", google_rating: 4.5 },
                        { name: "Trail Run Park", description: "Scenic trails.", activity_type: "Running", price: "Free", address: "Nature Rd", google_rating: 4.9 }
                    ]
                }
            };

        case 'THEATRE':
            return {
                prompt: `
                Act as a theatre critic and arts guide.
                Recommend 5 distinct shows or arts exhibitions near ${targetLocation}.
                Ensure these are real venues with accurate addresses in this region:
                - Type: ${inputs.type || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name, description, type, price, address (Venue Name), website, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "The Mock Opera", description: "A classic performance.", type: "Opera", price: "$$$", address: "Grand Theater", google_rating: 4.8 },
                        { name: "Comedy Cellar Mock", description: "Stand up night.", type: "Comedy", price: "$$", address: "Main St", google_rating: 4.6 }
                    ]
                }
            };

        case 'GAME':
            return {
                prompt: `
                Act as a gaming expert.
                Recommend 5 distinct video games:
                - Genre: ${inputs.genre || "Any"}
                - Players: ${inputs.players || "Any"}
                - Budget: ${inputs.budget || "Any"}
                - Duration: ${inputs.duration || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name, description, genre, platform (PC, Console, etc), multiplayer_support, price_type (Free/Paid), website (Steam/Store link)
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Mock Legends", description: "Battle royal fun.", genre: "Action", platform: "PC/Console", multiplayer_support: "Yes", price_type: "Free" },
                        { name: "Quest for Code", description: "Epic RPG.", genre: "RPG", platform: "PC", multiplayer_support: "Single", price_type: "Paid" }
                    ]
                }
            };

        case 'ESCAPE_ROOM':
            return {
                prompt: `
                Act as an escape room enthusiast.
                Recommend 5 distinct escape rooms located near ${targetLocation}.
                Ensure the addresses are accurate for the specific branches in this area:
                - Theme: ${inputs.themes || "Any"}
                - Difficulty: ${inputs.difficulty || "Any"}
                - Group Size: ${inputs.groupSize || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name, description, theme_type, difficulty_level, price, address, website, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "The Locked Room", description: "Spooky mystery.", theme_type: "Horror", difficulty_level: "Hard", price: "$$", address: "Dark Ln", google_rating: 4.7 },
                        { name: "Bank Heist Mock", description: "Technological puzzle.", theme_type: "Heist", difficulty_level: "Medium", price: "$$", address: "Bank St", google_rating: 4.5 }
                    ]
                }
            };

        case 'SPORTS':
            return {
                prompt: `
                Act as a local sports guide.
                Recommend 5 distinct sports venues or events near ${targetLocation}:
                - Sport: ${inputs.sport || "Any"}
                - Type: ${inputs.type || "Watch or Play"}
                - Membership: ${inputs.membership || "Any"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name, description, sport, price, address, website, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "City Stadium", description: "Watch the local team.", sport: "Soccer", price: "$$", address: "Stadium Dr", google_rating: 4.6 },
                        { name: "Community Courts", description: "Public tennis courts.", sport: "Tennis", price: "Free", address: "Park Ave", google_rating: 4.3 }
                    ]
                }
            };

        case 'CHEF':
            return {
                prompt: `
                Act as a professional chef planning a menu.
                Recommend 5 distinct menu concepts:
                - Occasion: ${inputs.occasion || "Any"}
                - Guests: ${inputs.guests || "Any"}
                - Cuisine: ${inputs.cuisine || "Any"}
                - Courses: ${inputs.courses || "Any"}
                - Effort: ${inputs.complexity || "Any"}
                - Dietary: ${inputs.dietary || "None"}
                
                ${extraInstructions}
                
                Return JSON with "recommendations" array.
                Fields: name (Menu Title), description (Theme overview), occasion, effort_level, cuisine, courses_summary (e.g. "Entree: ..., Main: ...")
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Italian Romance", description: "A classic 3-course Italian dinner.", occasion: "Date Night", effort_level: "Medium", cuisine: "Italian", courses_summary: "Caprese Salad, Risotto, Tiramisu" },
                        { name: "Taco Fiesta", description: "Fun and easy DIY tacos.", occasion: "Casual", effort_level: "Easy", cuisine: "Mexican", courses_summary: "Guacamole, Tacos, Churros" }
                    ]
                }
            };

        default:
            throw new Error(`Unknown tool key: ${toolKey}`);
    }
}
