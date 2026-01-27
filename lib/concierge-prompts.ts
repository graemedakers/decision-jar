
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
    // Normalize price for AI consumption
    const priceMap: Record<string, string> = {
        'any': 'Any',
        'cheap': '$ (Budget/Affordable)',
        'moderate': '$$ (Mid-range/Standard)',
        'expensive': '$$$ (Upscale/Luxury)'
    };
    const normalizedPrice = priceMap[inputs.price] || inputs.price || 'Any';
    const activeInputs: Record<string, any> = { ...inputs, price: normalizedPrice };

    switch (toolKey) {
        case 'DINING':
            return {
                prompt: `
                You are a Hyper-Local Food & Venue Scout. A user has performed a specific search for venues in ${targetLocation}.
                
                PRIMARY SEARCH QUERY: "${extraInstructions || "Best local restaurants"}"
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${activeInputs.cuisine || activeInputs.vibe || activeInputs.price ? `
                FILTER CONSTRAINTS:
                - Preferred Cuisine: ${activeInputs.cuisine || "Any"}
                - Target Vibe: ${activeInputs.vibe || "Any"}
                - Budget: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "cheap", focus on casual eats, cafes, and food trucks. EXCLUDE fine dining.
                - If budget is "moderate", suggest standard restaurants. EXCLUDE high-end "Chef's Table" or "Hatted" restaurants.
                ` : ''}

                YOUR MISSION:
                1. Simulate a deep search of local reviews, food blogs, and maps for ${targetLocation}.
                2. Identify relevant venues (default 5, unless user requested more) that are the HIGHEST RELEVANCE match for the PRIMARY SEARCH QUERY.
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
            // Detect how many items the user wants (default 5)
            const countMatch = extraInstructions?.match(/(\d+)\s*(recipes?|meals?|dishes?|ideas?|suggestions?|options?|places?|restaurants?|things?)/i);
            const itemCount = countMatch ? Math.min(parseInt(countMatch[1]), 10) : 5;

            // Pre-detect if this is a recipe request
            const isRecipeRequest = extraInstructions && /recipe|cook|ingredient|homemade|make at home|meal prep|what to cook/i.test(extraInstructions);

            return {
                prompt: `
                You are a versatile AI assistant that helps users find exactly what they're looking for.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                🎯 USER REQUEST:
                "${extraInstructions || 'General recommendations'}"
                
                📍 User Location: ${targetLocation}
                
                ${isRecipeRequest ? `
                ⛔ RECIPE REQUEST DETECTED - CRITICAL RULES:
                - The user is asking for HOME-COOKED RECIPES
                - You MUST return recipes with ingredients and cooking instructions
                - You MUST NOT return restaurants, cafes, or establishments
                - Every item MUST have ideaType: "recipe" and address: "At Home"
                - Every item MUST include typeData with ingredients array and instructions
                ` : ''}
                
                Additional context:
                - Budget: ${activeInputs.price || "Any"}

                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - STRICTLY follow the User's budget selection.
                - If "cheap", avoid upscale venues. If "expensive", prioritize premium experiences.
                - If "moderate", exclude luxury/fine-dining and focus on mid-range options.

                ⚠️ STEP 1 - UNDERSTAND WHAT THE USER WANTS:
                Read their request carefully and determine the CATEGORY:
                
                | User Asks For | ideaType to use |
                |---------------|-----------------|
                | Recipes, meals, dishes, cooking ideas, "what to cook", "home cooking" | "recipe" |
                | Restaurants, cafes, places to eat, "where to eat", "cheap eats" | "dining" |
                | Activities, things to do, experiences | "activity" |
                | Bars, drinks, cocktails, pubs | "bar" |
                | Movies, films, what to watch | "movie" |
                | Books, reading | "book" |
                | Events, concerts, shows | "event" |
                | Hotels, accommodation, staycation | "hotel" |
                | Games, video games | "game" |
                | YouTube videos | "youtube" |
                
                ⚠️ CRITICAL: 
                - If they ask for RECIPES or HOME COOKING → ideaType MUST be "recipe", address MUST be "At Home"
                - If they ask for "MEALS":
                   - "Meals for home", "to cook", "ingredients" → use "recipe"
                   - "Meals out", "cheap eats", "places" → use "dining"
                - If they ask for RESTAURANTS → ideaType MUST be "dining", address is the venue location
                - DO NOT confuse recipes with restaurants! "3 dinner recipes" ≠ "3 dinner restaurants"
                
                ⚠️ STEP 2 - GENERATE ${itemCount} RECOMMENDATIONS:
                Return exactly ${itemCount} items that match their request.
                ALL items should be the SAME ideaType (don't mix recipes with restaurants).
                IF generating RECIPES: Include FULL ingredient lists with quantities and step-by-step instructions.

                ⚠️ STEP 3 - FORMAT YOUR RESPONSE:
                Return JSON with a "recommendations" array. Each item MUST have:
                
                REQUIRED ROOT FIELDS (for all types):
                {
                  "name": "Item Name",
                  "description": "Brief 1-2 sentence description",
                  "ideaType": "<one of: recipe, dining, activity, bar, movie, book, event, hotel, game, youtube>",
                  "address": "<location OR 'At Home' for recipes/movies/books>",
                  "price": "$" | "$$" | "$$$" | "Free",
                  "google_rating": 4.5,
                  "typeData": { ... type-specific data ... }
                }
                
                TYPE-SPECIFIC "typeData" SCHEMAS:
                
                For ideaType: "recipe":
                {
                  "ingredients": ["1 cup flour", "2 eggs", "(include EXACT quantities)"],
                  "instructions": "Detailed step-by-step cooking instructions...",
                  "prepTime": 15,
                  "cookTime": 30,
                  "servings": 4,
                  "difficulty": "easy" | "medium" | "hard",
                  "cuisineType": "Italian",
                  "prepAhead": "Tips on what can be prepared in advance (e.g. 'Marinate chicken overnight')"
                }
                
                For ideaType: "dining" or "bar":
                {
                  "establishmentName": "Restaurant Name",
                  "cuisine": "Italian",
                  "priceRange": "$$",
                  "rating": 4.6,
                  "officialWebsite": "https://www.google.com/search?q=Restaurant+Name+official+website"
                }
                
                For ideaType: "activity":
                {
                  "activityName": "Activity Name",
                  "activityType": "outdoor" | "indoor" | "adventure",
                  "duration": 2,
                  "participants": { "min": 1, "max": 4 },
                  "officialWebsite": "https://www.google.com/search?q=Activity+Name"
                }
                
                For ideaType: "movie":
                {
                  "movieTitle": "Movie Name",
                  "genre": "Action",
                  "releaseYear": 2024,
                  "director": "Director Name",
                  "streamingPlatform": "Netflix"
                }
                
                For ideaType: "book":
                {
                  "bookTitle": "Book Name",
                  "author": "Author Name",
                  "genre": "Fiction",
                  "pages": 350
                }
                
                🎯 LINK ACCURACY: For any "officialWebsite" field:
                - ALWAYS use: https://www.google.com/search?q=[Name]+official+website
                - DO NOT guess domain names!
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Quick Chicken Stir-Fry",
                            description: "A fast, healthy weeknight dinner ready in 20 minutes.",
                            ideaType: "recipe",
                            price: "$",
                            address: "At Home",
                            google_rating: 2,
                            typeData: {
                                ingredients: ["500g chicken breast", "2 cups vegetables", "Soy sauce", "Garlic", "Ginger"],
                                instructions: "Step 1: Slice chicken. Step 2: Stir-fry with vegetables...",
                                prepTime: 10,
                                cookTime: 10,
                                servings: 4,
                                difficulty: "easy",
                                cuisineType: "Asian"
                            }
                        },
                        {
                            name: "One-Pot Pasta",
                            description: "Everything cooks in one pot for easy cleanup.",
                            ideaType: "recipe",
                            price: "$",
                            address: "At Home",
                            google_rating: 1,
                            typeData: {
                                ingredients: ["Pasta", "Tomatoes", "Basil", "Garlic", "Olive oil"],
                                instructions: "Step 1: Add all to pot. Step 2: Cook until pasta is done...",
                                prepTime: 5,
                                cookTime: 20,
                                servings: 4,
                                difficulty: "easy",
                                cuisineType: "Italian"
                            }
                        }
                    ]
                }
            };

        case 'BAR':
            return {
                prompt: `
                Act as a local nightlife concierge.
                Recommend distinct bars or drink spots (default 5, unless user requested more) near ${targetLocation}.
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Drinks Preference: ${activeInputs.drinks || "Any"}
                - Vibe: ${activeInputs.vibe || "Any"}
                - Price: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If "cheap", suggest pubs, local breweries, or dive bars. EXCLUDE cocktail lounges with $25+ drinks.
                - If "moderate", suggest standard bars and lively spots. EXCLUDE exclusive VIP lounges or upscale hotel bars.
                
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
                - Theme: ${activeInputs.theme || "Any"}
                - Stops: ${activeInputs.stops || "4"}
                - Vibe: ${activeInputs.vibe || "Any"}
                - Budget: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "moderate", suggest routes where drinks and entry typically match mid-range spending.
                - Avoid routes that only include extremely expensive "bottle service" clubs or high-end hotel bars if not requested.
                
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
                Recommend distinct hotels/stays (default 5, unless user requested more):
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Style: ${activeInputs.style || "Any"}
                - Must-Have Amenities: ${activeInputs.amenities || "Any"}
                - Budget: ${activeInputs.price || "Any"}
                ${activeInputs.dates_start ? `- Check-in: ${activeInputs.dates_start}` : ''}
                ${activeInputs.dates_end ? `- Check-out: ${activeInputs.dates_end}` : ''}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "moderate", EXCLUDE 5-star luxury hotels (e.g. Crown Towers, The Langham, Ritz-Carlton).
                - Suggest hotels that typically fall into the requested price category.
                - If you are unsure of the price, prioritize matching the Style and Amenities, but skew away from extreme luxury if not requested.
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "travel" and a "typeData" object.
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating. 
                   - These root fields are used for the main card display.
                4. 🎯 DEEP LINKING: For the root "website" field:
                   - PRIORITY 1: Direct link to the hotel on Booking.com or TripAdvisor.
                   - PRIORITY 2: If you cannot find a direct link, use a deep search:
                     https://www.google.com/search?q=[Hotel+Name]+booking.com+${activeInputs.dates_start ? `checkin+${activeInputs.dates_start}` : ''}
                   - Format: https://www.google.com/search?q=[Hotel+Name]+${targetLocation}+booking.com
                
                "typeData" Schema:
                {
                  "accommodationName": "Hotel Name",
                  "travelType": "hotel",
                  "amenities": ["Spa", "Free WiFi"],
                  "priceRange": "$$",
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
                Recommend distinct clubs/parties (default 5, unless user requested more):
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Music: ${activeInputs.music || "Any"}
                - Vibe: ${activeInputs.vibe || "Any"}
                - Price: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If "cheap", suggest pubs, local breweries, or dive bars. EXCLUDE cocktail lounges with $25+ drinks.
                - If "moderate", suggest standard bars and lively spots. EXCLUDE exclusive VIP lounges or upscale hotel bars.
                
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
            const isCinema = activeInputs.watchMode === 'Cinema';
            // URL-encode location for Google search
            const encodedLocation = encodeURIComponent(targetLocation);
            return {
                prompt: `
                Act as a movie critic and recommendation expert.
                Recommend distinct movies (default 5, unless user requested more) based on the following:
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                If the user asks for a SPECIFIC MOVIE by name (e.g., "Avatar", "Barbie", "Oppenheimer"), 
                you MUST include that exact movie as the FIRST recommendation, regardless of whether it's currently in cinemas.
                ` : ''}
                
                - Watch Mode: ${activeInputs.watchMode}
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
                - Genre: ${activeInputs.genre || "Any"}
                - Mood: ${activeInputs.mood || "Any"}
                - Era: ${activeInputs.era || "Any"}
                ${!isCinema && activeInputs.streamingServices ? `- Streaming on: ${activeInputs.streamingServices}` : ''}
                
                ${!isCinema ? `
                STREAMING MODE INSTRUCTIONS:
                - The "website" field MUST be a Google Search URL for watching the movie:
                  https://www.google.com/search?q=watch+[Movie+Name]+on+[Platform]
                - Set "price" to "N/A" (since it's subscription based) or leave empty.
                ` : ''}
                
                
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
                Recommend distinct books (default 5, unless user requested more):
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Genre: ${activeInputs.genre || "Any"}
                - Vibe: ${activeInputs.vibe || "Any"}
                - Length: ${activeInputs.length || "Any"}
                - Era: ${activeInputs.era || "Any"}
                
                
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
                  "isbn": "978-3-16-148410-0",
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
                Recommend distinct spas/studios (default 5, unless user requested more) near ${targetLocation}.
                Prioritize venues as close as possible to this area:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Activity: ${activeInputs.activity || "Any"}
                - Vibe: ${activeInputs.vibe || "Any"}
                - Price: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "moderate", focus on standard studios and community wellness centers. EXCLUDE ultra-luxury private spas or elite wellness clubs.
                
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
                Recommend distinct gyms or fitness activities (default 5, unless user requested more) near ${targetLocation}.
                Prioritize options within easy reach of this area:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Activity: ${activeInputs.activity || "Any"}
                - Level: ${activeInputs.level || "Any"}
                - Price: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "cheap", focus on public parks, community centers, or budget gyms. EXCLUDE high-end "boutique" fitness studios.
                
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
                Recommend distinct shows, productions, or arts exhibitions (default 5, unless user requested more).
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Type: ${activeInputs.type || "Any"}
                - Vibe: ${activeInputs.vibe || "Any"}
                - Price: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If "moderate", focus on general admission or gallery seating. EXCLUDE premium box seats or VIP packages.
                - Suggest venues and shows where standard seating falls into the requested category.
                
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

        case 'MUSIC':
            return {
                prompt: `
                Act as a music discovery guide.
                Recommend distinct albums or concerts (default 5, unless user requested more).
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                ` : ''}
                
                - Artist/Genre: ${activeInputs.artist || "Any"}
                - Type: ${activeInputs.type || "Album or Concert"}
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "music" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address (venue or "Spotify/Apple"), price, google_rating.
                
                "typeData" Schema:
                {
                  "artist": "Artist Name",
                  "title": "Album/Concert Title",
                  "type": "album" | "concert",
                  "releaseYear": 2024,
                  "genre": ["Pop"],
                  "listenLink": "https://..."
                }
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Mock Album",
                            description: "A great new release.",
                            ideaType: "music",
                            price: "$",
                            address: "Spotify",
                            google_rating: 4.5,
                            typeData: {
                                artist: "Mock Artist",
                                title: "Mock Album",
                                type: "album",
                                releaseYear: 2024,
                                genre: ["Pop"],
                                listenLink: "https://spotify.com"
                            }
                        }
                    ]
                }
            };

        case 'GAME':
            return {
                prompt: `
                Act as a gaming expert.
                Recommend distinct video games (default 5, unless user requested more):
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Genre: ${activeInputs.genre || "Any"}
                - Players: ${activeInputs.players || "Any"}
                - Budget: ${activeInputs.price || "Any"}
                - Duration: ${activeInputs.duration || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If "cheap", prioritize free-to-play or low-cost indie games.
                - If "moderate", focus on standard AAA titles. EXCLUDE "Collectors Editions" or expensive deluxe bundles.
                
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
                  "estimatedPlaytime": 60,
                  "playUrl": "link to store/play"
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
                                rating: "T",
                                estimatedPlaytime: 20
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
                Recommend distinct escape rooms (default 5, unless user requested more) located near ${targetLocation}.
                Ensure the addresses are accurate for the specific branches in this area:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Theme: ${activeInputs.themes || "Any"}
                - Difficulty: ${activeInputs.difficulty || "Any"}
                - Group Size: ${activeInputs.groupSize || "Any"}
                - Price: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - Ensure the requested price range is respected for the group size.
                
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
                Recommend distinct sports venues or events (default 5, unless user requested more) near ${targetLocation}:
                
                ${getExactNamePriorityRule(extraInstructions)}
                
                ${extraInstructions ? `
                🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
                ${extraInstructions}
                
                YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Sport: ${activeInputs.sport || "Any"}
                - Type: ${activeInputs.type || "Watch or Play"}
                - Membership: ${activeInputs.membership || "Any"}
                - Budget: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "cheap", suggest public courts, free fields, or affordable local matches. EXCLUDE premium club access.
                - If "moderate", focus on standard ticket prices or standard venue hire. EXCLUDE VIP boxes or corporate suites.
                
                ⚠️ CRITICAL OUTPUT RULES:
                1. Return JSON with a "recommendations" array.
                2. Every recommendation MUST have "ideaType": "event" and "typeData".
                3. Every recommendation MUST also include root fields: name, description, address, price, google_rating, website. 
                   - These root fields are used for the main card display.
                4. 🎯 LINK ACCURACY: For the root "website" field:
                   - ALWAYS use a Google Search URL: https://www.google.com/search?q=[Venue+Name]+${targetLocation}+sports+tickets
                
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
            // Count how many recipes to generate (default 3)
            const recipeCountMatch = extraInstructions?.match(/(\d+)\s*(recipes?|meals?|dishes?|menus?)/i);
            const recipeCount = recipeCountMatch ? Math.min(parseInt(recipeCountMatch[1]), 7) : 3;

            return {
                prompt: `
                🍳 YOU ARE A HOME COOKING CHEF & RECIPE GENERATOR 🍳
                
                ⛔ CRITICAL RESTRICTION - READ CAREFULLY:
                - You are ONLY allowed to return HOME-COOKED RECIPES
                - You are FORBIDDEN from returning restaurants, cafes, takeout places, or any establishments
                - Every item MUST be something the user can COOK AT HOME in their own kitchen
                - If you return a restaurant instead of a recipe, you have FAILED your task
                
                🎯 USER REQUEST:
                "${extraInstructions || 'Recipe ideas'}"
                
                USER PREFERENCES:
                - Occasion: ${activeInputs.occasion || "Everyday Cooking"}
                - Guests: ${activeInputs.guests || "2-4 People"}
                - Cuisine: ${activeInputs.cuisine || "Any"}
                - Courses: ${activeInputs.courses || "Main Dish Only"}
                - Effort: ${activeInputs.complexity || "Quick & Easy"}
                - Dietary: ${activeInputs.dietary || "None"}
                - Budget: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "cheap", focus on cost-effective ingredients and pantry staples.
                - If "moderate", use standard quality ingredients. EXCLUDE ultra-premium luxury ingredients (e.g. Wagyu, Truffles, Saffron) unless requested.
                
                ${isSecretMode ? `🤫 SECRET MODE: Keep dish names vague.` : ''}

                📋 YOUR TASK:
                Generate exactly ${recipeCount} HOME-COOKED RECIPES with:
                1. A complete ingredient list with EXACT QUANTITIES (e.g., "200g chicken breast", "2 tbsp olive oil")
                2. Step-by-step cooking instructions numbered clearly
                3. Prep time and cook time
                4. Serving size
                5. Difficulty level (easy/medium/hard)

                ⚠️ MANDATORY OUTPUT FORMAT:
                Return JSON with "recommendations" array containing EXACTLY ${recipeCount} recipes.
                
                EACH RECIPE MUST FOLLOW THIS EXACT STRUCTURE:
                {
                  "name": "Recipe Name (e.g., 'Honey Garlic Chicken')",
                  "description": "Brief 1-2 sentence description of the dish",
                  "ideaType": "recipe",
                  "address": "At Home",
                  "price": "$",
                  "google_rating": 3,
                  "details": "A summary of the dish and cooking approach",
                  "typeData": {
                    "title": "Recipe Name",
                    "ingredients": [
                      "400g pasta",
                      "200g bacon, diced",
                      "4 eggs",
                      "100g parmesan, grated",
                      "2 cloves garlic, minced",
                      "Salt and pepper to taste"
                    ],
                    "instructions": "1. Boil pasta according to package directions.\\n2. Cook bacon until crispy.\\n3. Whisk eggs with parmesan.\\n4. Combine hot pasta with bacon.\\n5. Remove from heat and stir in egg mixture.\\n6. Season and serve immediately.",
                    "prepTime": 10,
                    "cookTime": 20,
                    "servings": 4,
                    "difficulty": "easy",
                    "cuisineType": "Italian",
                    "prepAhead": "Can prep ingredients up to a day in advance"
                  }
                }

                🚫 DO NOT:
                - Return restaurant names or addresses
                - Return establishments or venues
                - Return food delivery options
                - Forget the typeData object
                - Forget the ingredients array
                - Forget the instructions
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
                - Vibe: ${activeInputs.vibe || "Any"}
                - Structure: ${activeInputs.structure || "Any"}
                - Cuisine: ${activeInputs.cuisine || "Any"}
                - Budget: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "moderate", EXCLUDE multi-course hatted restaurant pairings or 5-star luxury hotel activities.
                - Focus on high-quality mid-range experiences that feel special without breaking the bank.

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
                - Vibe: ${activeInputs.mood || "Any"}
                - Company: ${activeInputs.company || "Any"}
                - Specific Day: ${activeInputs.day || "Any"}
                - Budget: ${activeInputs.price || "Any"}

                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - STRICTLY follow the User's budget selection.
                - If "cheap", avoid upscale venues. If "expensive", prioritize premium experiences.
                - If "moderate", exclude luxury/fine-dining and focus on mid-range options.
 
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
                - Dates: ${activeInputs.dates_start || "Unspecified"} to ${activeInputs.dates_end || "Unspecified"}
                - Travel Party: ${activeInputs.party || "Any"}
                - Transport Mode: ${activeInputs.transport || "Any"}
                - Max Travel Distance / Time: ${activeInputs.maxDistance || "Any"}
                - Dining Preferences: ${activeInputs.dining || "Any"}
                - Interests / Vibe: ${activeInputs.interests || "Any"}
                - Budget: ${activeInputs.price || "Any"}

                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If budget is "moderate", EXCLUDE luxury resorts and first-class travel options.
                - Focus on comfortable, well-rated 3-4 star accommodations and affordable local activities.

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
        case 'RECIPE':
            // Count how many recipes to generate (default 3)
            const recipeCountMatchRec = extraInstructions?.match(/(\d+)\s*(recipes?|meals?|dishes?|menus?)/i);
            const recipeCountRec = recipeCountMatchRec ? Math.min(parseInt(recipeCountMatchRec[1]), 7) : 3;

            return {
                prompt: `
                🍳 YOU ARE A HOME COOKING RECIPE GENERATOR 🍳
                
                ⛔ CRITICAL RESTRICTION - READ CAREFULLY:
                - You are ONLY allowed to return HOME-COOKED RECIPES
                - You are FORBIDDEN from returning restaurants, cafes, takeout places, or any establishments
                - Every item MUST be something the user can COOK AT HOME
                - If you return a restaurant instead of a recipe, you have FAILED your task
                
                🎯 USER REQUEST:
                "${extraInstructions || 'Recipe ideas'}"
                
                USER PREFERENCES:
                - Meal Type: ${activeInputs.mealType || "Any"}
                - Cuisine: ${activeInputs.cuisine || "Any"}
                - Dietary: ${activeInputs.dietary || "None"}
                - Prep Time: ${activeInputs.time || "Any"}
                - Budget: ${activeInputs.price || "Any"}
                
                ⚠️ BUDGET ADHERENCE (CRITICAL):
                - If "cheap", prioritize budget-friendly ingredients and bulk cooking.
                - If "moderate", exclude gourmet/luxury specialty ingredients unless relevant.
                
                ${isSecretMode ? `🤫 SECRET MODE: Keep dish names vague.` : ''}

                📋 YOUR TASK:
                Generate exactly ${recipeCountRec} HOME-COOKED RECIPES with:
                1. A complete ingredient list with EXACT QUANTITIES (e.g., "200g chicken breast", "2 tbsp olive oil")
                2. Step-by-step cooking instructions numbered clearly
                3. Prep time and cook time
                4. Serving size
                5. Difficulty level (easy/medium/hard)

                ⚠️ MANDATORY OUTPUT FORMAT:
                Return JSON with "recommendations" array containing EXACTLY ${recipeCountRec} recipes.
                
                EACH RECIPE MUST FOLLOW THIS EXACT STRUCTURE:
                {
                  "name": "Recipe Name (e.g., 'Honey Garlic Chicken')",
                  "description": "Brief 1-2 sentence description of the dish",
                  "ideaType": "recipe",
                  "address": "At Home",
                  "price": "$",
                  "google_rating": 3,
                  "details": "A summary of the dish",
                  "website": "https://www.google.com/search?q=Recipe+Name+recipe",
                  "typeData": {
                    "title": "Recipe Name",
                    "ingredients": [
                      "400g pasta",
                      "200g bacon, diced",
                      "4 eggs",
                      "100g parmesan, grated",
                      "2 cloves garlic, minced",
                      "Salt and pepper to taste"
                    ],
                    "instructions": "1. Boil pasta according to package directions.\\n2. Cook bacon until crispy.\\n3. Whisk eggs with parmesan.\\n4. Combine hot pasta with bacon.\\n5. Remove from heat and stir in egg mixture.\\n6. Season and serve immediately.",
                    "prepTime": 10,
                    "cookTime": 20,
                    "servings": 4,
                    "difficulty": "easy",
                    "cuisineType": "Italian",
                    "prepAhead": "Can prep ingredients up to a day in advance"
                  }
                }

                🚫 DO NOT:
                - Return restaurant names or addresses
                - Return establishments or venues
                - Return food delivery options
                - Forget the typeData object
                - Forget the ingredients array
                - Forget the instructions
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Authentic Carbonara",
                            description: "Roman classic with guanciale, pecorino, and eggs. No cream!",
                            price: "$$",
                            address: "At Home",
                            google_rating: 4.5,
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
                        }
                    ]
                }
            };

        case 'YOUTUBE':
            return {
                prompt: `
                Act as a YouTube Discovery Engine.
                
                🛑 MISSION:
                Use your search tool to find 5 HIGHLY RELEVANT YouTube videos for: "${extraInstructions || inputs.topic}" in "${targetLocation}".
                
                ⚠️ REQUIRED JSON STRUCTURE:
                {
                  "recommendations": [
                    {
                      "name": "Video Title",
                      "description": "Short, engaging summary.",
                      "website": "DIRECT_YOUTUBE_URL",
                      "ideaType": "youtube",
                      "typeData": {
                        "videoId": "11_CHAR_ID",
                        "watchUrl": "DIRECT_YOUTUBE_URL",
                        "channelTitle": "Creator Name"
                      }
                    }
                  ]
                }
                
                Every recommendation MUST include the direct YouTube watch URL in both "website" and "typeData.watchUrl".
                `,
                mockResponse: {
                    recommendations: [
                        {
                            name: "Pros & Cons of Intermittent Fasting",
                            description: "A balanced look at fasting benefits.",
                            website: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            ideaType: "youtube",
                            typeData: {
                                videoId: "dQw4w9WgXcQ",
                                watchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                                title: "Pros & Cons of Intermittent Fasting",
                                channelTitle: "Health Insider"
                            }
                        }
                    ]
                }
            };

        default:
            throw new Error(`Unknown tool key: ${toolKey}`);
    }
}
