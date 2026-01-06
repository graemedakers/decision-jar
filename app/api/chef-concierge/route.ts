import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';
import { reliableGeminiCall } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check premium status
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberships: { include: { jar: true } },
                couple: true // Legacy fallback
            },
        });

        const activeJar = (user?.activeJarId ? user.memberships.find(m => m.jarId === user.activeJarId)?.jar : null) ||
            user?.memberships?.[0]?.jar ||
            user?.couple;

        if (!user || !activeJar) {
            return NextResponse.json({ error: 'No active jar' }, { status: 400 });
        }

        if (!isCouplePremium(activeJar) && !isUserPro(user)) {
            return NextResponse.json({ error: 'Premium required' }, { status: 403 });
        }

        const rateLimit = await checkRateLimit(user);
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded', details: rateLimit.error }, { status: 429 });
        }

        const { occasion, cuisine, courses, complexity, dietary, guests } = await request.json().catch(() => ({}));

        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            // Mock data
            await new Promise(resolve => setTimeout(resolve, 1500));
            return NextResponse.json({
                recommendations: [
                    {
                        name: "Seared Scallops & Risotto",
                        description: "A romantic 3-course Italian dinner featuring seared scallops, wild mushroom risotto, and tiramisu.",
                        speciality: "Italian",
                        price: "$$",
                        address: "Hero: Scallops & Risotto",
                        google_rating: 4.9,
                        website: "https://example.com/recipe",
                        details: `# Seared Scallops & Wild Mushroom Risotto\n\n**Serves:** ${guests || '2 People'}\n**Time:** 45 mins\n\n## 🛒 Shopping List\n- 6 Large Sea Scallops\n- 1.5 cups Arborio Rice\n- 500g Wild Mushrooms\n- 1L Vegetable Stock\n- Parmesan Cheese\n- White Wine\n\n## 👨‍🍳 Instructions\n1. Sauté mushrooms...\n2. Toast rice...\n3. Sear scallops...`
                    }
                ]
            });
        }

        let extraInstructions = "";
        if (dietary && dietary.length > 0) {
            extraInstructions += `All dishes must be strict: ${dietary.join(", ")}.\n`;
        }

        const prompt = `
        Act as a Michelin-star Executive Chef planning a private dining event.
        Create 5 distinct, high-quality menu concepts for a "${occasion}" occasion.
        
        **Event Details:**
        - Guests: ${guests || "2 People"}
        - Cuisine Style: ${cuisine || "Chef's Choice"}
        - Course Structure: ${courses || "3 Courses"}
        - Complexity: ${complexity || "Manageable"}
        ${extraInstructions}
        
        **Your Task:**
        For each menu concept, you must provide a "details" field that acts as a complete "Run Sheet" for the host. 
        This "details" field must be formatted in clean Markdown.
        
        **For each recommendation, provide:**
        1. **Name**: Creative Title (e.g., "Tuscan Sunset Feast").
        2. **Description**: Appetizing summary of the dishes.
        3. **Speciality**: Dominant cuisine.
        4. **Price**: Ingredient cost estimate ($/$$/$$$).
        5. **Address**: use this for the "Hero Dish" highlight (e.g. "Hero: 12-Hour Lamb Shoulder").
        6. **Google Rating**: Chef's rating /5.
        7. **details**: A LONG, RICH Markdown string. It MUST include:
           - **Menu Overview**: The dishes being served.
           - **Shopping List**: Categorized list of ingredients with quantities for ${guests || "2 People"}.
           - **Prep Timeline**: What to do the day before vs. hour before.
           - **Step-by-Step Execution**: Concise cooking instructions for the main elements.
           - **Plating Tips**: How to make it look pro.
        
        **Format:** JSON Object with "recommendations" array.
        {
            "recommendations": [
                {
                    "name": "string",
                    "description": "string",
                    "speciality": "string",
                    "price": "$$",
                    "address": "Hero: string",
                    "google_rating": 4.8,
                    "details": "# Title\\n\\n## Menu\\n...\\n\\n## Shopping List\\n- Item 1\\n- Item 2\\n\\n## Instructions\\n..."
                }
            ]
        }
        `;

        const result = await reliableGeminiCall(prompt);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Chef Concierge error:', error);
        return NextResponse.json({
            recommendations: [
                {
                    name: "Simple Pasta Night",
                    description: "Garlic bread, Spaghetti Bolognese, and Gelato.",
                    speciality: "Italian",
                    price: "$",
                    address: "Quick & Easy",
                    google_rating: 4.5
                }
            ]
        });
    }
}
