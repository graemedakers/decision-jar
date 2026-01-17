
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
                Act as a local dining concierge for ${targetLocation}.
                
                ${extraInstructions ? `
USER REQUEST: ${extraInstructions}

Based on this request, recommend 5 venues that match what the user is looking for.
                ` : `Recommend 5 distinct restaurants.`}
                
                ${!extraInstructions ? `
Additional preferences:
                - Cuisine: ${inputs.cuisine || "Any good local food"}
                - Vibe/Atmosphere: ${inputs.vibe || "Any"}
                - Price Range: ${inputs.price || "Any"}
                ` : ''}
                
                Ensure all venues are currently open for business.
                
                For each venue, provide:
                - Name
                - A brief description (1-2 sentences)
                - Cuisine type or venue category
                - Price range ($, $$, $$$)
                - Approximate address or neighborhood
                - Website URL (or Google Search URL if specific site unknown)
                - Typical opening hours
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

        case 'CONCIERGE':
            return {
                prompt: `
                Act as a versatile local lifestyle concierge.
                
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
🔴 REMINDER: All 5 recommendations must satisfy: "${extraInstructions}"
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
                
                Return JSON with "recommendations" array.
                Fields: name, description, category (e.g. "Dining", "Activity"), price, address, website, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Hidden Garden Cafe", description: "A beautiful secret garden spot.", category: "Dining", price: "$$", address: "Green Lane", google_rating: 4.8 },
                        { name: "City Rock Climbing", description: "Indoor climbing gym.", category: "Activity", price: "$$", address: "Sport St", google_rating: 4.7 }
                    ]
                }
            };

        case 'BAR':
            return {
                prompt: `
                Act as a local nightlife concierge.
                Recommend 5 distinct bars or drink spots near ${targetLocation}.
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Drinks Preference: ${inputs.drinks || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
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

        case 'BAR_CRAWL':
            return {
                prompt: `
            Act as a nightlife guide and route planner.
            Create 3 DISTINCT Bar Crawl Routes near ${targetLocation}.
            
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
            
            Return JSON with "recommendations" array (size 3).
            Fields:
            - name: Creative Route Name (e.g. "The Downtown Dive Tour")
            - description: Brief vibe summary
            - duration_label: Est. Duration / Stops
            - price: Budget ($, $$, $$$)
            - google_rating: Avg Rating (Number)
            - details: Markdown timeline.
              **FORMAT:**
              ### The Route
              **Stop 1:** [Bar Name] - [Why this spot?]
              **Stop 2:** [Bar Name] - [Speciality Drink?]
              ...
              
              *Walking time: approx 10 mins between stops.*
            `,
                mockResponse: {
                    recommendations: [
                        { name: "Downtown Classics", description: "Best cocktails in the city.", duration_label: "4 Stops", price: "$$$", google_rating: 4.6, details: "### The Route\n**Stop 1:** The Library..." },
                        { name: "Dive Bar Hero", description: "Cheap drinks and good vibes.", duration_label: "5 Stops", price: "$", google_rating: 4.2, details: "### The Route\n**Stop 1:** Moe's..." }
                    ]
                }
            };

        case 'HOTEL':
            return {
                prompt: `
                Act as a travel concierge for ${targetLocation}.
                Recommend 5 distinct hotels/stays:
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Style: ${inputs.style || "Any"}
                - Must-Have Amenities: ${inputs.amenities || "Any"}
                - Budget: ${inputs.price || "Any"}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Music: ${inputs.music || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Genre: ${inputs.genre || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Length: ${inputs.length || "Any"}
                - Era: ${inputs.era || "Any"}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Activity: ${inputs.activity || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Activity: ${inputs.activity || "Any"}
                - Level: ${inputs.level || "Any"}
                - Price: ${inputs.price || "Any"}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Type: ${inputs.type || "Any"}
                - Vibe: ${inputs.vibe || "Any"}
                - Price: ${inputs.price || "Any"}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Genre: ${inputs.genre || "Any"}
                - Players: ${inputs.players || "Any"}
                - Budget: ${inputs.budget || "Any"}
                - Duration: ${inputs.duration || "Any"}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Theme: ${inputs.themes || "Any"}
                - Difficulty: ${inputs.difficulty || "Any"}
                - Group Size: ${inputs.groupSize || "Any"}
                
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
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                - Sport: ${inputs.sport || "Any"}
                - Type: ${inputs.type || "Watch or Play"}
                - Membership: ${inputs.membership || "Any"}
                
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
                Create 3 DISTINCT, complete menu concepts.
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                Preference:
                - Occasion: ${inputs.occasion || "Any"}
                - Guests: ${inputs.guests || "Any"}
                - Cuisine: ${inputs.cuisine || "Any"}
                - Courses: ${inputs.courses || "Any"}
                - Effort: ${inputs.complexity || "Any"}
                - Dietary: ${inputs.dietary || "None"}
                
                INSTRUCTIONS:
                1. Provide a cohesive menu with courses that complement each other.
                2. Include a brief shopping list summary or key ingredients.
                3. Outline a basic timing strategy for the cook.
                
                Return JSON with "recommendations" array (size 3).
                Fields:
                - name: Menu Title
                - description: Brief theme overview
                - price: Estimated Cost Level ($, $$, $$$)
                - google_rating: Complexity Rating (1-5, keep as number)
                - details: A formatted string containing the Menu & Guide.
                  **IMPORTANT FORMATTING FOR 'details':**
                  Use Markdown.
                  Format as:
                  ### The Menu
                  **Entree:** [Dish Name] - [Description]
                  **Main:** [Dish Name] - [Description]
                  **Dessert:** [Dish Name] - [Description]
                  
                  ### Key Ingredients
                  - [List key complex items...]
                  
                  ### Chef's Strategy
                  - [Step 1: Prep ahead...]
                  - [Step 2: Cooking order...]
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Italian Romance", description: "A classic 3-course Italian dinner.", price: "$$", google_rating: 3, details: "### The Menu\n**Entree:** Caprese Salad\n**Main:** Risotto\n..." },
                        { name: "Taco Fiesta", description: "Fun and easy DIY tacos.", price: "$", google_rating: 1, details: "### The Menu\n**Main:** Tacos..." }
                    ]
                }
            };




        case 'DATE_NIGHT':
            return {
                prompt: `
                Act as a romantic concierge and event planner.
                Create 3 DISTINCT, complete date night plans near ${targetLocation}.
                
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
                
                Return JSON with "recommendations" array (size 3).
                Fields:
                - name: Creative Title (e.g. "Classic Romance in SoHo")
                - description: Brief summary (1 sentence).
                - duration_label: Est. Duration (e.g. "3-4 Hours").
                - price: Overall Budget ($, $$, $$$).
                - details: A formatted string containing the Timeline.
                  **IMPORTANT FORMATTING FOR 'details':**
                  Use Markdown.
                  Format as a timeline:
                  **6:00 PM:** [Venue Name] - [Activity/Description] (Approx $)
                  **7:30 PM:** [Venue Name] - [Activity/Description] (Approx $)
                  ...
                  
                  *Include a tip for transport or parking if relevant.*
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Classic Dinner & Movie", description: "A timeless date night combo.", duration_label: "4 Hours", price: "$$", details: "**6:00 PM:** The Local Italian - Dinner... \n**8:00 PM:** Cinema 6 - Movie..." },
                        { name: "Active Evening", description: "Bowling and Burgers.", duration_label: "3 Hours", price: "$", details: "**6:00 PM:** Strike Bowling... \n**7:30 PM:** Burger Joint..." }
                    ]
                }
            };

        case 'WEEKEND_EVENTS':
            return {
                prompt: `
                Act as a local events coordinator.
                Recommend 5 distinct events or activities happening THIS WEEKEND near ${targetLocation}.
                
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
                1. PRIMARY GOAL: Find events scheduled for a SHORT TIME PERIOD only (e.g. happening specifically this weekend, this week, or this month).
                   - Look for: Pop-up markets, festivals, live music gigs, theatre shows, limited-run exhibitions, sports matches, community events.
                   - Do NOT suggest "always open" places like standard museums, parks, or cinemas UNLESS they have a specific special event on.
                2. FALLBACK: Only if you cannot find 5 high-quality time-limited events, fill the remaining spots with exceptional "evergreen" activities that perfectly match the requested vibe.
                3. Ensure venues are confirmed open on the requested days.
                
                Return JSON with "recommendations" array.
                Fields: name, description, day (e.g. "Saturday 2pm"), price, address, website, google_rating
                `,
                mockResponse: {
                    recommendations: [
                        { name: "Saturday Farmers Market", description: "Fresh produce and live music.", day: "Saturday Morning", price: "Free", address: "Town Square", google_rating: 4.8 },
                        { name: "Jazz in the Park", description: "Smooth jazz and picnics.", day: "Sunday 3pm", price: "Free", address: "Central Park", google_rating: 4.7 }
                    ]
                }
            };

        case 'HOLIDAY':
            return {
                prompt: `
                Act as a master travel agent and local expert.
                Create 3 DISTINCT, detailed holiday itineraries for a trip to ${targetLocation}.
                
                ${extraInstructions ? `
🎯 CRITICAL USER REQUIREMENTS (HIGHEST PRIORITY):
${extraInstructions}

YOU MUST ensure ALL recommendations fully align with these specific requirements.
                ` : ''}
                
                TRIP DETAILS:
                - Dates: ${inputs.dates_start || "Unspecified"} to ${inputs.dates_end || "Unspecified"}
                - Travel Party: ${inputs.party || "Any"}
                - Transport Mode: ${inputs.transport || "Any"}
                - Max Travel Distance/Time: ${inputs.maxDistance || "Any"}
                - Dining Preferences: ${inputs.dining || "Any"}
                - Interests/Vibe: ${inputs.interests || "Any"}
                - Budget: ${inputs.price || "Any"}

                INSTRUCTIONS:
                1. Maximize the time available.
                2. Consider TYPICAL WEATHER for this location during these specific dates.
                3. Include real local events, markets, or festivals that occur around these dates if known.
                4. Ensure logistics make sense (e.g. if using public transport, group varying locations logically).
                5. Each recommendation must be a UNIQUE approach (e.g. "Relaxed & Foodie", "Adventure & Nature", "Culture & History").

                Return JSON with "recommendations" array (size 3).
                Each item represents a FULL ITINERARY VARIATION.
                
                Fields:
                - name: Creative Title (e.g. "Paris: The Culinary Journey")
                - description: Brief summary of the vibe (1-2 sentences).
                - duration_label: The duration (e.g. "3 Days, 2 Nights").
                - price: Budget level ($, $$, $$$).
                - details: A formatted string containing the FULL Day-by-Day Itinerary. 
                  **IMPORTANT FORMATTING FOR 'details':**
                  Use Markdown.
                  Format each day as:
                  ### Day 1: [Date] - [Theme]
                  **Morning:** [Activity Title] - [Description] (Map: [Link])
                  **Lunch:** [Restaurant] - [Cuisine] (Map: [Link])
                  **Afternoon:** ...
                  **Dinner:** ...
                  
                  
                  *IMPORTANT: For map links, use FULL Google Maps URLs in this format:*
                  *https://www.google.com/maps/search/?api=1&query=[Place+Name]+[Address]*
                  *DO NOT use short URLs (maps.app.goo.gl) as they are deprecated and often expired.*
                  *Example: https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris*
                `,
                mockResponse: {
                    recommendations: [
                        { name: "The Cultural Explorer", description: "A deep dive into history and museums.", duration_label: "3 Days", price: "$$", details: "### Day 1...\n..." },
                        { name: "The Foodie Escape", description: "Tasting the best local flavors.", duration_label: "3 Days", price: "$$$", details: "### Day 1...\n..." },
                        { name: "Nature & Chill", description: "Hiking trails and spa evenings.", duration_label: "3 Days", price: "$", details: "### Day 1...\n..." }
                    ]
                }
            };

        default:
            throw new Error(`Unknown tool key: ${toolKey}`);
    }
}
