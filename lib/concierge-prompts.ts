
export type PromptGeneratorResponse = {
    prompt: string;
    mockResponse: { recommendations: any[] };
};

/**
 * Universal priority rule for all concierges when user specifies an exact name
 */
const getExactNamePriorityRule = (extraInstructions: string) => {
    if (!extraInstructions) return '';
    return `
🎯 EXACT NAME PRIORITY RULE:
If the user mentions a SPECIFIC NAME of something (a restaurant, bar, book, movie, game, venue, etc.),
you MUST include that exact item as your FIRST recommendation, unless it violates other criteria they specified.

Examples:
- "I want to go to Joe's Pizza" → Joe's Pizza MUST be recommendation #1
- "Tell me about The Great Gatsby" → The Great Gatsby MUST be recommendation #1  
- "Find The Mockingbird bar" → The Mockingbird MUST be recommendation #1
- "I heard about a place called Sunrise Cafe" → Sunrise Cafe MUST be recommendation #1

The remaining recommendations should be similar alternatives that also match their criteria.
`;
};

export const getConciergePromptAndMock = (
    toolKey: string,
    inputs: Record<string, any>,
    targetLocation: string,
    extraInstructions: string,
    isSecretMode?: boolean
): PromptGeneratorResponse => {
    switch (toolKey) {
        case 'DINING':
            return {
                prompt: `
                You are a Hyper-Local Food & Venue Scout. A user has performed a specific search for venues in ${targetLocation}.
                
                PRIMARY SEARCH QUERY: "${extraInstructions || "Best local restaurants"}"
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${inputs.cuisine || inputs.vibe || inputs.price ? `
                FILTER CONSTRAINTS:
                - Preferred Cuisine: ${inputs.cuisine || "Any"}
                - Target Vibe: ${inputs.vibe || "Any"}
                - Budget: ${inputs.price || "Any"}
                ` : ''}

                YOUR MISSION:
                1. Simulate a deep search of local reviews, food blogs, and maps for ${targetLocation}.
                2. Identify 5 venues that are the HIGHEST RELEVANCE match for the PRIMARY SEARCH QUERY.
                3. If the query asks for something specific (e.g. "brunch cafe with amazing coffee"), IGNORE generic dinner restaurants. Focus ONLY on those specific types of venues.
                4. Prioritize "Local Legends" and "Top Rated" spots that real locals would recommend in a direct chat.
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "dining" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. The "description" should be a compelling 1-2 sentence hook. DO NOT include markdown headers.
                5. 🎯 LINK ACCURACY: For the root "website" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                   - This is non-negotiable. Do not provide a direct link like .com unless you are 100% certain it exists.
                   - When in doubt, use the Google Search URL.
                
                "typeData" Schema:
                {
                  "establishmentName": "Restaurant Name",
                  "cuisine": "Italian",
                  "mealType": "dinner",
                  "priceRange": "$$",
                  "dietaryOptions": ["Vegetarian", "Gluten-Free"],
                  "rating": 4.6,
                  "address": "123 Street Name",
                  "menuUrl": "https://restaurant.com/menu",
                  "reservationRequired": false
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "The Rustic Spoon",
                            description: "Farm-to-table dining with a seasonal menu.",
                            cuisine: "Modern American",
                            price: "$$",
                            address: "Market St",
                            google_rating: 4.6,
                            ideaType: "dining",
                            typeData: {
                                establishmentName: "The Rustic Spoon",
                                cuisine: "Modern American",
                                mealType: "dinner",
                                priceRange: "$$",
                                menuUrl: "https://example.com/menu"
                            }
                        },
                        { name: "Bella Italia", description: "Authentic handmade pasta.", cuisine: "Italian", price: "$$", address: "Little Italy", google_rating: 4.5, ideaType: "dining" },
                        { name: "Spice Route", description: "Aromatic curries.", cuisine: "Indian", price: "$$", address: "Central Ave", google_rating: 4.4, ideaType: "dining" }
                    ]
                }
            };

        case 'CONCIERGE':
            return {
                prompt: `
                Act as a versatile local lifestyle concierge.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                USER REQUEST/CONTEXT: "${extraInstructions}"
                
                ⚠️ CRITICAL INSTRUCTION: The user's request above is your PRIMARY DIRECTIVE.
                - INTERPRET their request LITERALLY - if they ask for cafes, ALL 5 MUST BE CAFES; if they ask for activities, ALL 5 MUST BE ACTIVITIES
                - DO NOT SUBSTITUTE or change what they're asking for
                - If their request is specific (e.g., "brunch cafes with good coffee"), ALL 5 RECOMMENDATIONS MUST match ALL criteria
                - If they mention meal times (breakfast, brunch, lunch, dinner), ALL 5 RECOMMENDATIONS MUST be open and suitable for that exact time
                - DO NOT MIX TYPES: If they asked for one thing, don't give them something else for recommendations 2-5
                
                REPEAT: EVERY SINGLE ONE OF THE 5 RECOMMENDATIONS MUST MATCH THE USER'S SPECIFIC REQUEST ABOVE.
                
                ` : ''}
                
                Respond to the user's request with 5 distinct recommendations near ${targetLocation}.
                
                ${extraInstructions ? `
                泡 REMINDER: All 5 recommendations must satisfy: "${extraInstructions}"
                ` : ''}
                
                Additional preferences (secondary to the critical requirements above):
                - Mood: ${inputs.mood || "Any"}
                - Company: ${inputs.company || "Any"}
                - Duration: ${inputs.duration || "Any"}
                - Budget: ${inputs.price || "Any"}
                
                INSTRUCTIONS:
                1. Interpret the "USER REQUEST" intelligently. If they ask for "fun things to do", suggest activities. If they ask for "Italian food", suggest restaurants.
                2. If the request is vague, provide a diverse mix of high-quality local options (e.g. 1 dining, 1 activity, 1 event, 1 hidden gem).
                3. Ensure all recommendations are real, open businesses or locations.
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have an "ideaType" (activity, dining, event) and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                   - These root fields are used for the main card display.
                4. DO NOT include markdown headers in description or details.
                5. 🎯 LINK ACCURACY: For "officialWebsite":
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL to guarantee a working link for the user.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                   - This is safer than hallucinating a broken .com or .com.au link.
                   - When in doubt, ALWAYS use the search link.
                   - This is safer than hallucinating a broken .com or .com.au link.
                
                "typeData" Schema (for activities):
                {
                  "activityName": "Name",
                  "activityType": "activity",
                  "participants": { "min": 1, "max": 4 },
                  "duration": 2, // hours
                  "rating": 4.8,
                  "officialWebsite": "https://www.google.com/search?q=Venue+Name+official+website",
                  "location": { "name": "Address" }
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Hidden Garden Cafe",
                            description: "A beautiful secret garden spot.",
                            category: "Dining",
                            price: "$$",
                            address: "Green Lane",
                            google_rating: 4.8,
                            ideaType: "activity",
                            typeData: {
                                activityName: "Hidden Garden Cafe",
                                activityType: "activity",
                                location: { name: "Green Lane" }
                            }
                        },
                        { name: "City Rock Climbing", description: "Indoor climbing gym.", category: "Activity", price: "$$", address: "Sport St", google_rating: 4.7 }
                    ]
                }
            };

        case 'BAR':
            return {
                prompt: `
                Act as a local nightlife concierge.
                Recommend 5 distinct bars or drink spots near ${targetLocation}.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Drinks Preference: ${inputs.drinks || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
                Ensure they are real, currently open businesses with accurate physical addresses.
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "dining" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. "typeData" MUST include the "features" array (e.g. ["Cocktails", "Patio"]).
                5. 🎯 LINK ACCURACY: For the root "website" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                
                "typeData" Schema:
                {
                  "establishmentName": "Bar Name",
                  "cuisine": "Bar/Nightlife",
                  "priceRange": "$$",
                  "rating": 4.7,
                  "features": ["Craft Beer", "Live Music"],
                  "menuUrl": "https://bar.com/drinks"
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "The Mockingbird",
                            description: "Lively atmosphere.",
                            speciality: "Cocktails",
                            price: "$$$",
                            address: "Oak Ave",
                            google_rating: 4.7,
                            ideaType: "dining",
                            typeData: {
                                establishmentName: "The Mockingbird",
                                cuisine: "Cocktails",
                                priceRange: "$$$",
                                features: ["Cocktails"],
                                menuUrl: "https://mockingbird.com/menu"
                            }
                        },
                        { name: "Hops & Dreams", description: "Local brews.", speciality: "Beer", price: "$", address: "Main St", google_rating: 4.5 },
                        { name: "Vino Valley", description: "Elegant wine bar.", speciality: "Wine", price: "$$$", address: "River Walk", google_rating: 4.8 }
                    ]
                }
            };

        case 'BAR_CRAWL':
            return {
                prompt: `
                Act as a nightlife guide and route planner.
                Create 3 DISTINCT Bar Crawl Routes near ${targetLocation}.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                Preferences:
                - Theme: ${inputs.theme || "Any"}
                - Stops: ${inputs.stops || "4"}
                - Vibe: ${inputs.vibe || "Any"}
                - Budget: ${inputs.price || "Any"}
                
                INSTRUCTIONS:
                1. Create a logical walking or short-drive route between venues.
                2. Use REAL, popular bars that fit the theme.
                3. Ensure the order makes sense (e.g. Start at a lighter place, end at a club/late night spot).
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array (size 3).
                2. Every recommendation MUST have "ideaType": "itinerary" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. DO NOT include the timeline in the "details" field; put ALL itinerary data in the "steps" array.
                5. 🎯 LINK ACCURACY: For the root "website" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                
                "typeData" Schema:
                {
                  "title": "Crawl Name",
                  "totalDuration": "4 hours",
                  "vibe": "Party",
                  "steps": [
                      { "order": 1, "time": "19:00", "activity": "Start at Bar A", "location": { "name": "Bar A" } },
                      { "order": 2, "time": "20:00", "activity": "Move to Bar B", "location": { "name": "Bar B" } }
                  ]
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Downtown Classics",
                            description: "Best cocktails in the city.",
                            duration_label: "4 Stops",
                            price: "$$$",
                            address: targetLocation,
                            google_rating: 4.6,
                            ideaType: "itinerary",
                            typeData: {
                                title: "Downtown Classics",
                                totalDuration: "4 hours",
                                vibe: "Upscale",
                                steps: [
                                    { order: 1, time: "18:00", activity: "Cocktails at The Library", location: { name: "The Library" } },
                                    { order: 2, time: "19:30", activity: "Wine at The Cellar", location: { name: "The Cellar" } }
                                ]
                            }
                        },
                        { name: "Dive Bar Hero", description: "Cheap drinks and good vibes.", duration_label: "5 Stops", price: "$", address: targetLocation, google_rating: 4.2, ideaType: "itinerary" }
                    ]
                }
            };

        case 'HOTEL':
            return {
                prompt: `
                Act as a travel concierge for ${targetLocation}.
                Recommend 5 distinct hotels/stays:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Style: ${inputs.style || "Any"}
                - Must-Have Amenities: ${inputs.amenities || "Any"}
                - Budget: ${inputs.price || "Any"}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "travel" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. 🎯 LINK ACCURACY: For the root "website" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                
                "typeData" Schema:
                {
                  "accommodationName": "Hotel Name",
                  "travelType": "hotel",
                  "amenities": ["Spa", "Free WiFi"],
                  "priceRange": "$$$",
                  "rating": 4.5,
                  "destination": { "name": "Address/City" }
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Grand Hotel Mock",
                            description: "Luxury stay.",
                            speciality: "Luxury",
                            price: "$$$",
                            address: "Grand Ave",
                            google_rating: 4.7,
                            ideaType: "travel",
                            typeData: {
                                destination: { name: "Grand Ave" },
                                travelType: "hotel",
                                accommodationName: "Grand Hotel Mock",
                                amenities: ["Luxury", "Spa"]
                            }
                        },
                        { name: "Boutique Inn", description: "Charming and cozy.", speciality: "Boutique", price: "$$", address: "Main St", google_rating: 4.5 }
                    ]
                }
            };

        case 'NIGHTCLUB':
            return {
                prompt: `
                Act as a nightlife promoter for ${targetLocation}.
                Recommend 5 distinct clubs/parties:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Music: ${inputs.music || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "activity" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. 🎯 LINK ACCURACY: For the root "website" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                
                "typeData" Schema:
                {
                  "activityName": "Club Name",
                  "activityType": "nightlife",
                  "location": { "name": "Address" },
                  "participants": { "min": 2, "max": 20 },
                  "rating": 4.5,
                  "duration": 4
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Club Neon",
                            description: "High energy dance floor.",
                            music: "EDM",
                            price: "$$$",
                            address: "Club District",
                            google_rating: 4.3,
                            ideaType: "activity",
                            typeData: {
                                activityName: "Club Neon",
                                activityType: "nightlife",
                                location: { name: "Club District" },
                                participants: { min: 4, max: 200 }
                            }
                        },
                        { name: "The Lounge", description: "Chill vibes and R&B.", music: "R&B", price: "$$", address: "Downtown", google_rating: 4.5 }
                    ]
                }
            };

        case 'MOVIE':
            // Movie is special: Logic for Streaming vs Cinema
            const isCinema = inputs.watchMode === 'Cinema';
            // URL-encode location for Google search
            const encodedLocation = encodeURIComponent(targetLocation);
            return {
                prompt: `
                Act as a movie critic and recommendation expert.
                Recommend 5 distinct movies based on the following:
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                If the user asks for a SPECIFIC MOVIE by name (e.g., "Avatar", "Barbie", "Oppenheimer"), 
                you MUST include that exact movie as the FIRST recommendation, regardless of whether it's currently in cinemas.
                ` : ''}
                
                - Watch Mode: ${inputs.watchMode}
                ${isCinema ? `
                CINEMA MODE INSTRUCTIONS:
                ${extraInstructions ? `
                PRIORITY 1: If user requested a specific movie, include it FIRST with status "Check Availability"
                PRIORITY 2: Fill remaining slots with movies currently in cinemas
                ` : `
                - Recommend movies that are currently showing or coming soon to cinemas
                `}
                - Focus on the movie quality and match to user preferences
                - DO NOT try to guess specific cinema names or generate cinema-specific URLs
                - The "website" field MUST use this EXACT Google Search format for showtimes:
                  https://www.google.com/search?q=[Movie+Title+URL+Encoded]+showtimes+near+${encodedLocation}
                  
                  Example: For movie "Dune: Part Two" the URL should be:
                  https://www.google.com/search?q=Dune%3A+Part+Two+showtimes+near+${encodedLocation}
                
                The Google search will show:
                - If movie is showing: all nearby cinemas with showtimes and booking links
                - If movie is NOT showing: user sees "no showtimes" and can explore alternatives
                ` : ''}
                - Genre: ${inputs.genre || "Any"}
                - Mood: ${inputs.mood || "Any"}
                - Era: ${inputs.era || "Any"}
                ${!isCinema && inputs.streamingServices ? `- Streaming on: ${inputs.streamingServices}` : ''}
                
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "movie" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. DO NOT include markdown headers in the description.
                
                "typeData" Schema:
                {
                  "title": "Movie Title",
                  "year": 2024,
                  "director": "Director Name",
                  "genre": ["Action", "Sci-Fi"],
                  "rating": "PG-13",
                  "runtime": 120,
                  "cast": ["Actor A", "Actor B"],
                  "streamingPlatform": "Netflix", // or "Cinema"
                  "watchMode": "streaming", // "cinema" or "streaming"
                  "imdbRating": "8.5",
                  "plot": "Plot summary here..."
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Mockingbird Lane",
                            description: "A gripping thriller.",
                            year: "2024",
                            rating: "92%",
                            genre: "Thriller",
                            streaming_service: "Netflix",
                            website: "https://netflix.com",
                            price: "$",
                            address: "Netflix",
                            google_rating: 4.8,
                            ideaType: "movie",
                            typeData: {
                                title: "Mockingbird Lane",
                                year: 2024,
                                genre: ["Thriller"],
                                platform: "Netflix"
                            }
                        },
                        { name: "Laugh Track", description: "Hilarious comedy.", year: "2023", rating: "88%", genre: "Comedy", streaming_service: "Hulu", website: "https://hulu.com", price: "$", address: "Hulu", google_rating: 4.5, ideaType: "movie" }
                    ]
                }
            };

        case 'BOOK':
            return {
                prompt: `
                Act as a literary curator.
                Recommend 5 distinct books:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Genre: ${inputs.genre || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Length: ${inputs.length || "Any"}
                - Era: ${inputs.era || "Any"}
                
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "book" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. DO NOT include markdown headers in the description.
                
                "typeData" Schema:
                {
                  "title": "Book Title",
                  "author": "Author Name",
                  "genre": ["Mystery", "Thriller"],
                  "yearPublished": 2023,
                  "pageCount": 300,
                  "format": "physical",
                  "plot": "Brief plot summary..."
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "The Silent Mock",
                            description: "A mystery thriller.",
                            author: "Jane Doe",
                            year: "2023",
                            genre: "Mystery",
                            page_count: "320",
                            price: "$",
                            google_rating: 4.5,
                            ideaType: "book",
                            typeData: {
                                title: "The Silent Mock",
                                author: "Jane Doe",
                                genre: ["Mystery"],
                                pageCount: 320
                            }
                        },
                        { name: "Future Past", description: "Sci-fi epic.", author: "John Smith", year: "2024", genre: "Sci-Fi", price_type: "Paid", price: "$$", address: "PC", google_rating: 4.7, ideaType: "book" }
                    ]
                }
            };

        case 'WELLNESS':
            return {
                prompt: `
                Act as a wellness concierge.
                Recommend 5 distinct spas/studios near ${targetLocation}.
                Prioritize venues as close as possible to this area:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Activity: ${inputs.activity || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "activity" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. 🎯 LINK ACCURACY: For the root "website" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                
                "typeData" Schema:
                {
                  "activityName": "Spa Name",
                  "activityType": "wellness",
                  "location": { "name": "Address" },
                  "rating": 4.8,
                  "officialWebsite": "https://spa-official.com",
                  "duration": 1.5 // hours
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Zen Garden Spa",
                            description: "Relaxing massage therapy.",
                            type: "Massage",
                            price: "$$",
                            address: "Green St",
                            google_rating: 4.8,
                            ideaType: "activity",
                            typeData: {
                                activityName: "Zen Garden Spa",
                                activityType: "leisure",
                                location: { name: "Green St" }
                            }
                        },
                        { name: "Flow Yoga", description: "Peaceful studio.", type: "Yoga", price: "$", address: "Main St", google_rating: 4.9, ideaType: "activity" }
                    ]
                }
            };

        case 'FITNESS':
            return {
                prompt: `
                Act as a fitness guide.
                Recommend 5 distinct gyms or fitness activities near ${targetLocation}.
                Prioritize options within easy reach of this area:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Activity: ${inputs.activity || "Any"}
                - Level: ${inputs.level || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "activity" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. 🎯 LINK ACCURACY: For the root "website" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                
                "typeData" Schema:
                {
                  "activityName": "Gym Name",
                  "activityType": "fitness",
                  "location": { "name": "Address" },
                  "rating": 4.5,
                  "officialWebsite": "https://gym-official.com",
                  "duration": 1 // hours
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Iron Gym",
                            description: "Old school bodybuilding.",
                            activity_type: "Gym",
                            price: "$",
                            address: "Muscle Ave",
                            google_rating: 4.5,
                            ideaType: "activity",
                            typeData: {
                                activityName: "Iron Gym",
                                activityType: "active",
                                location: { name: "Muscle Ave" }
                            }
                        },
                        { name: "Trail Run Park", description: "Scenic trails.", activity_type: "Running", price: "Free", address: "Nature Rd", google_rating: 4.9, ideaType: "activity" }
                    ]
                }
            };

        case 'THEATRE':
            return {
                prompt: `
                Act as a theatre critic and arts guide for ${targetLocation}.
                Recommend 5 distinct shows, productions, or arts exhibitions.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Type: ${inputs.type || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
                ⚠️ CRITICAL DATE REQUIREMENTS:
                - ONLY recommend shows that are CURRENTLY RUNNING or UPCOMING (opening soon).
                - DO NOT include shows that have already CLOSED or finished their run.
                - If you are unsure whether a show is still running, DO NOT include it.
                - Focus on shows with confirmed future performance dates.
                - Include the show dates or run period if known.
                
                For the 'website' field: Provide the official ticketing website or a Google search URL:
                https://www.google.com/search?q=[Show+Name]+tickets+${encodeURIComponent(targetLocation)}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "event" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. "typeData" MUST include the specific venue name and a formatted date.
                5. 🎯 LINK ACCURACY: For the root "website" field and "officialWebsite" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS for Theatres or Venues.
                   - ALWAYS use a Google Search URL to guarantee a working link for the user.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                
                "typeData" Schema:
                {
                  "eventName": "Show Name",
                  "eventType": "theatre",
                  "venue": { "name": "Venue Name", "id": "optional" },
                  "date": "2024-03-15T19:30:00Z",
                  "showDates": "Runs through April",
                  "ticketUrl": "https://...",
                  "officialWebsite": "https://theatre-official.com"
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "The Mock Opera",
                            description: "A classic performance.",
                            type: "Opera",
                            price: "$$$",
                            address: "Grand Theater",
                            google_rating: 4.8,
                            show_dates: "Now - April 2026",
                            ideaType: "event",
                            typeData: {
                                eventName: "The Mock Opera",
                                eventType: "theatre",
                                venue: { name: "Grand Theater" },
                                date: new Date().toISOString()
                            }
                        },
                        { name: "Comedy Cellar Mock", description: "Stand up night.", type: "Comedy", price: "$$", address: "Main St", google_rating: 4.6, show_dates: "Every Friday", ideaType: "event" }
                    ]
                }
            };

        case 'GAME':
            return {
                prompt: `
                Act as a gaming expert.
                Recommend 5 distinct video games:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Genre: ${inputs.genre || "Any"}
                - Players: ${inputs.players || "Any"}
                - Budget: ${inputs.budget || "Any"}
                - Duration: ${inputs.duration || "Any"}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "game" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display. (Address can be "Online" or platform names)
                4. DO NOT include markdown headers in the description.
                
                "typeData" Schema:
                {
                  "title": "Game Title",
                  "gameType": "video_game",
                  "genre": ["RPG", "Action"],
                  "platform": ["PC", "PS5"],
                  "minPlayers": 1,
                  "maxPlayers": 4,
                  "coop": true,
                  "rating": "T",
                  "estimatedPlaytime": 60
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Mock Legends",
                            description: "Battle royal fun.",
                            genre: "Action",
                            platform: "PC/Console",
                            multiplayer_support: "Yes",
                            price_type: "Free",
                            price: "Free",
                            address: "PC/Console",
                            google_rating: 4.2,
                            ideaType: "game",
                            typeData: {
                                title: "Mock Legends",
                                gameType: "video_game",
                                genre: ["Action", "Battle Royale"],
                                platform: ["PC", "Console"],
                                minPlayers: 1,
                                maxPlayers: 100,
                                coop: true,
                                rating: "T"
                            }
                        },
                        { name: "Quest for Code", description: "Epic RPG.", genre: "RPG", platform: "PC", multiplayer_support: "Single", price_type: "Paid", price: "$$", address: "PC", google_rating: 4.8, ideaType: "game" }
                    ]
                }
            };

        case 'ESCAPE_ROOM':
            return {
                prompt: `
                Act as an escape room enthusiast.
                Recommend 5 distinct escape rooms located near ${targetLocation}.
                Ensure the addresses are accurate for the specific branches in this area:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Theme: ${inputs.themes || "Any"}
                - Difficulty: ${inputs.difficulty || "Any"}
                - Group Size: ${inputs.groupSize || "Any"}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "activity" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. 🎯 LINK ACCURACY: For the root "website" field:
                   - 🛑 STOP! DO NOT GUESS DOMAINS.
                   - ALWAYS use a Google Search URL.
                   - Format: https://www.google.com/search?q=[Venue+Name]+official+website
                
                "typeData" Schema:
                {
                  "activityName": "Escape Room Name",
                  "activityType": "active", 
                  "location": { "name": "Address" },
                  "rating": 4.7,
                  "duration": 1 // hours
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "The Locked Room",
                            description: "Spooky mystery.",
                            theme_type: "Horror",
                            difficulty_level: "Hard",
                            price: "$$",
                            address: "Dark Ln",
                            google_rating: 4.7,
                            ideaType: "activity",
                            typeData: {
                                activityName: "The Locked Room",
                                activityType: "active",
                                location: { name: "Dark Ln" }
                            }
                        },
                        { name: "Bank Heist Mock", description: "Technological puzzle.", theme_type: "Heist", difficulty_level: "Medium", price: "$$", address: "Bank St", google_rating: 4.5, ideaType: "activity" }
                    ]
                }
            };

        case 'SPORTS':
            return {
                prompt: `
                Act as a local sports guide.
                Recommend 5 distinct sports venues or events near ${targetLocation}:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Sport: ${inputs.sport || "Any"}
                - Type: ${inputs.type || "Watch or Play"}
                - Membership: ${inputs.membership || "Any"}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "event" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                
                "typeData" Schema:
                {
                  "eventName": "Match/Game Name",
                  "eventType": "sports",
                  "venue": { "name": "Stadium Name" },
                  "date": "2024-02-20T14:00:00Z",
                  "ticketUrl": "https://...",
                  "officialWebsite": "https://www.google.com/search?q=City+Stadium+official+website"
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "City Stadium",
                            description: "Watch the local team.",
                            sport: "Soccer",
                            price: "$$",
                            address: "Stadium Dr",
                            google_rating: 4.6,
                            ideaType: "event",
                            typeData: {
                                eventName: "City Stadium Match",
                                eventType: "sports",
                                venue: { name: "City Stadium" },
                                date: new Date().toISOString()
                            }
                        },
                        { name: "Community Courts", description: "Public tennis courts.", sport: "Tennis", price: "Free", address: "Park Ave", google_rating: 4.3, ideaType: "event" }
                    ]
                }
            };

        case 'CHEF':
            return {
                prompt: `
                Act as a professional Executive Chef and Menu Planner.
                Create 3 DISTINCT, premium, and complete dinner party menu concepts.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                "${extraInstructions}"
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                USER PREFERENCES:
                - Occasion: ${inputs.occasion || "Any"}
                - Guests: ${inputs.guests || "Any"}
                - Cuisine: ${inputs.cuisine || "Any"}
                - Courses: ${inputs.courses || "Any"}
                - Effort: ${inputs.complexity || "Any"}
                - Dietary: ${inputs.dietary || "None"}
                
                ${isSecretMode ? `
                🤫 SECRET MODE ACTIVE:
                The user wants to keep these ideas a complete surprise. 
                Do NOT include the specific names of dishes or ingredients in the high-level 'name' and 'description' fields if they would give away the surprise too easily. 
                Focus on the VIBE and THEME in the name/description, and keep the specific menu details inside the 'details' field.
                ` : ''}

                YOUR MISSION:
                1. Design a cohesive, restaurant-quality menu that can be executed at home.
                2. Provide a FULL list of ingredients with estimated quantities suitable for the guest count.
                3. Include detailed cooking instructions for each course.
                4. Ensure the complexity matches the user's requested effort level.
                5. You MUST include structured recipe data in the 'typeData' object.

                Return JSON with "recommendations" array (size 3).
                Each item represents a dinner plan or recipe.

                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "recipe" and a "typeData" object.
                3. Every recommendation MUST include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. Every recommendation MUST include a "details" field with a markdown formatted summary of the full menu.
                5. "address" should be your kitchen or "At Home".
                6. "google_rating" should be the complexity level (1-5).
                
                "typeData" Schema:
                {
                  "ingredients": ["1 cup flour", "2 eggs"...],
                  "instructions": "Step 1...", 
                  "prepTime": 30, // minutes
                  "cookTime": 45, // minutes
                  "servings": 4,
                  "difficulty": "medium", // easy, medium, hard
                  "cuisineType": "Italian",
                  "prepAhead": "Explain what can be done in advance..."
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Authentic Carbonara",
                            description: "Roman classic with guanciale, pecorino, and eggs. No cream!",
                            price: "$$",
                            address: "At Home",
                            google_rating: 3,
                            occasion: "Romantic Date Night In",
                            details: "### 🍽️ The Menu\n1. **Primi**: Spaghetti alla Carbonara\n2. **Dolce**: Simple Tiramisu\n\n**Difficulty:** Medium\n**Time:** 30 mins",
                            ideaType: "recipe",
                            typeData: {
                                ingredients: ["Spaghetti", "Guanciale", "Pecorino Romano", "Eggs", "Black Pepper"],
                                instructions: "Boil water...",
                                prepTime: 15,
                                cookTime: 15,
                                servings: 2,
                                difficulty: "medium",
                                cuisineType: "Italian"
                            }
                        },
                        {
                            name: "Taco Fiesta",
                            description: "DIY taco bar with fresh salsas.",
                            price: "$",
                            address: "At Home",
                            google_rating: 1,
                            details: "### 🍽️ The Menu\n...",
                            ideaType: "recipe"
                        }
                    ]
                }
            };

        case 'DATE_NIGHT':
            return {
                prompt: `
                Act as a romantic concierge and event planner.
                Create 3 DISTINCT, complete date night plans near ${targetLocation}.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                User Preferences:
                - Vibe: ${inputs.vibe || "Any"}
                - Structure: ${inputs.structure || "Any"}
                - Cuisine: ${inputs.cuisine || "Any"}
                - Budget: ${inputs.price || "Any"}

                INSTRUCTIONS:
                1. Each plan must be a logical sequence of events (e.g. Pre-dinner drink -> Dinner -> Dessert/Activity).
                2. Use REAL venues that are open in the evening.
                3. Ensure the venues are within walking distance or a short drive of each other.
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "itinerary" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. DO NOT include the timeline in the "details" field; put ALL itinerary data in the "steps" array.
                
                "typeData" Schema:
                {
                  "title": "Date Night Title",
                  "totalDuration": "4 hours",
                  "vibe": "Romantic",
                  "steps": [
                      { "order": 1, "time": "18:00", "activity": "Drinks at Venue A", "location": { "name": "Venue A" } },
                      { "order": 2, "time": "19:30", "activity": "Dinner at Venue B", "location": { "name": "Venue B" } }
                  ]
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Classic Dinner & Movie",
                            description: "A timeless date night combo.",
                            duration_label: "4 Hours",
                            price: "$$",
                            address: targetLocation,
                            google_rating: 4.8,
                            details: "**6:00 PM:** The Local Italian - Dinner... \n**8:00 PM:** Cinema 6 - Movie...",
                            ideaType: "itinerary",
                            typeData: {
                                title: "Classic Dinner & Movie",
                                totalDuration: "4 hours",
                                vibe: "Romantic",
                                steps: [
                                    { order: 1, time: "18:00", activity: "Dinner at The Local Italian", location: { name: "The Local Italian" } },
                                    { order: 2, time: "20:00", activity: "Movie at Cinema 6", location: { name: "Cinema 6" } }
                                ]
                            }
                        },
                        { name: "Active Evening", description: "Bowling and Burgers.", duration_label: "3 Hours", price: "$", address: targetLocation, google_rating: 4.5, details: "**6:00 PM:** Strike Bowling... \n**7:30 PM:** Burger Joint...", ideaType: "itinerary" }
                    ]
                }
            };

        case 'WEEKEND_EVENTS':
            return {
                prompt: `
                Act as a local events coordinator.
                Recommend 5 distinct events or activities happening THIS WEEKEND near ${targetLocation}.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
 
                Preferences:
                - Vibe: ${inputs.mood || "Any"}
                - Company: ${inputs.company || "Any"}
                - Specific Day: ${inputs.day || "Any"}
                - Budget: ${inputs.price || "Any"}
 
                INSTRUCTIONS:
                1. PRIORITY HIERARCHY (CRITICAL): You MUST prioritize events based on their scarcity:
                   - TIER 1 (TOP PRIORITY): Ultra-short-term events (e.g., a 2-day festival, a weekend carnival, a one-night-only concert).
                   - TIER 2: Medium-term limited events (e.g., a 6-week theatre show, a season-specific market).
                   - TIER 3 (LOWEST PRIORITY): Recurring year-round events (e.g., an exhibition on every Saturday).
                2. PRIMARY GOAL: Find events scheduled for a SHORT TIME PERIOD only. 
                   - Prioritize Tier 1 > Tier 2 > Tier 3.
                   - Do NOT suggest "always open" places like standard museums, parks, or cinemas UNLESS they have a specific special event on.
                3. FALLBACK: Only if you cannot find 5 high-quality time-limited events, fill the remaining spots with TIER 3 recurring events or exceptional "evergreen" activities that perfectly match the requested vibe.
                4. Ensure venues are confirmed open on the requested days.
                 
                🔗 CRITICAL - WEBSITE FIELD:
                DO NOT guess or invent website URLs. Instead, use this Google Search format:
                https://www.google.com/search?q=[Event+or+Venue+Name]+[Location]+official+website

                This ensures users always find the correct, current website.
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "event" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. DO NOT include markdown headers in the description.
                
                "typeData" Schema:
                {
                  "eventName": "Event Name",
                  "eventType": "festival",
                  "venue": { "name": "Location Name" },
                  "date": "2024-01-20T10:00:00Z",
                  "dayOfWeek": "Saturday",
                  "ticketUrl": "https://..."
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Saturday Farmers Market",
                            description: "Fresh produce and live music.",
                            day: "Saturday Morning",
                            price: "Free",
                            address: "Town Square",
                            google_rating: 4.5,
                            ideaType: "event",
                            typeData: {
                                eventName: "Saturday Farmers Market",
                                eventType: "market",
                                venue: { name: "Town Square" },
                                dayOfWeek: "Saturday"
                            }
                        },
                        { name: "Live Jazz @ The Blue Note", description: "Smooth evening vibes.", day: "Sunday Night", price: "$$", address: "Bleecker St", google_rating: 4.8, ideaType: "event" }
                    ]
                }
            };

        case 'HOLIDAY':
            return {
                prompt: `
                Act as a master travel agent and local expert.
                Create 3 DISTINCT, detailed holiday itineraries for a trip to ${targetLocation}.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                "${extraInstructions}"
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                TRIP DETAILS:
                - Dates: ${inputs.dates_start || "Unspecified"} to ${inputs.dates_end || "Unspecified"}
                - Travel Party: ${inputs.party || "Any"}
                - Transport Mode: ${inputs.transport || "Any"}
                - Max Travel Distance / Time: ${inputs.maxDistance || "Any"}
                - Dining Preferences: ${inputs.dining || "Any"}
                - Interests / Vibe: ${inputs.interests || "Any"}
                - Budget: ${inputs.price || "Any"}

                INSTRUCTIONS:
                1. Maximize the time available.
                2. Consider TYPICAL WEATHER for this location during these specific dates.
                3. Include real local events, markets, or festivals that occur around these dates if known.
                4. Ensure logistics make sense (e.g. if using public transport, group varying locations logically).
                5. Each recommendation must be a UNIQUE approach (e.g. "Relaxed & Foodie", "Adventure & Nature", "Culture & History").

                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "itinerary" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. "address" should be the target location or "Various".
                5. DO NOT include the breakdown in the "details" field; put ALL day-by-day data in the "steps" array.
                
                "typeData" Schema:
                {
                  "title": "Holiday Itinerary Name",
                  "totalDuration": "3 Days",
                  "vibe": "Adventure",
                  "steps": [
                    { "day": 1, "activity": "Morning hike", "location": { "name": "Mountain Park" } },
                    { "day": 1, "activity": "Lunch at Cafe", "location": { "name": "Village Cafe" } },
                    { "day": 2, "activity": "Beach visit", "location": { "name": "Sunny Shore" } }
                  ]
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "The Cultural Explorer",
                            description: "A deep dive into history and museums.",
                            duration_label: "3 Days",
                            address: targetLocation,
                            price: "$$",
                            google_rating: 4.8,
                            ideaType: "itinerary",
                            typeData: {
                                title: "The Cultural Explorer",
                                totalDuration: "3 Days",
                                vibe: "Culture",
                                steps: [
                                    { day: 1, activity: "Louvre Museum Tour", location: { name: "The Louvre, Paris" } },
                                    { day: 1, activity: "Dinner at Benoit", location: { name: "Benoit Paris" } },
                                    { day: 2, activity: "Palace of Versailles", location: { name: "Versailles" } }
                                ]
                            }
                        },
                        {
                            name: "The Foodie Escape",
                            description: "Tasting the best local flavors.",
                            duration_label: "3 Days",
                            address: targetLocation,
                            price: "$$$",
                            google_rating: 4.9,
                            ideaType: "itinerary",
                            typeData: {
                                title: "The Foodie Escape",
                                totalDuration: "3 Days",
                                vibe: "Foodie",
                                steps: [
                                    { day: 1, activity: "Market Tour", location: { name: "Local Market" } }
                                ]
                            }
                        }
                    ]
                }
            };

        default:
            throw new Error(`Unknown tool key: ${toolKey}`);
    }
}
