import { LucideIcon, Users, Brain, Sparkles, Zap, MessageSquare, Compass, Heart, GraduationCap, ChefHat, Utensils, Layers, Bell, Clapperboard } from "lucide-react";

export interface ResourceGuide {
    slug: string;
    title: string;
    description: string;
    icon: LucideIcon;
    category: string;
    readTime: string;
    structuredData: any;
    faqs: { question: string; answer: string }[];
    sections: {
        title: string;
        content: string;
        imagePrompt?: string; // For generating asset if needed later
    }[];
}

export const RESOURCE_GUIDES: ResourceGuide[] = [
    {
        slug: "building-social-connections",
        category: "Social",
        title: "The Adult Friendship Crisis: Building Lasting Communities",
        description: "Why making friends as an adult is difficult, and how structured decision-making can fix it.",
        icon: Users,
        readTime: "8 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How to build social connections as an adult",
            "description": "A comprehensive guide on overcoming social friction and building communities using structured activities."
        },
        faqs: [
            {
                question: "How do I build a community from scratch?",
                answer: "Start small with a shared interest. Use a tool like Decision Jar to remove the 'What should we do?' friction, which is the #1 reason group meetups fail."
            },
            {
                question: "Why is it so hard to make decisions with friends?",
                answer: "Decision fatigue and the 'Paradox of Choice' often lead to groups never meeting. Structured voting sessions solve this by filtering ideas through the group's real-time consensus."
            },
            {
                question: "What happens if we can't agree?",
                answer: "The Voting Mode includes built-in tie-breaking logic. If a clear winner isn't found, the system can automatically pick a random winner from the top choices or start an immediate runoff round."
            }
        ],
        sections: [
            {
                title: "The Friction of Adult Friendships",
                content: "As we grow older, the organic environments for friendship—like school or sports—disappear. We enter 'Management Mode,' where even seeing a friend requires a complex dance of scheduling and negotiation. This friction is where most social connections die."
            },
            {
                title: "Structured Serendipity",
                content: "The secret to lasting group dynamics isn't planning every detail; it's introducing 'Structured Serendipity.' By using a shared Idea Jar, you move the burden of choice from the individual to the system. This allows everyone to show up as guests, not just one person being the exhausted organizer."
            }
        ]
    },
    {
        slug: "reducing-mental-load",
        category: "Productivity",
        title: "Reducing Mental Load: The Power of Automated Decisions",
        description: "How to simplify your personal and professional life by outsourcing routine choices.",
        icon: Brain,
        readTime: "6 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How to reduce cognitive load with automated life choices",
            "description": "Learn how to use executive tools to eliminate decision fatigue in your daily routine."
        },
        faqs: [
            {
                question: "What is mental load?",
                answer: "Mental load is the invisible labor of managing tasks and decisions. It’s not just doing the laundry; it’s remembering that the laundry needs doing and choosing which cycle to use."
            },
            {
                question: "Can an app really help me organize my life?",
                answer: "Yes. By delegating 'Play' decisions (where to eat, what to watch) to a smart system, you save your limited mental energy for high-impact work decisions."
            }
        ],
        sections: [
            {
                title: "Decision Fatigue is Real",
                content: "The average adult makes 35,000 decisions a day. By the time you get home, your 'willpower battery' is drained. This is why couples often end up watching a show they've seen 100 times—it's the only zero-effort choice left."
            },
            {
                title: "Outsourcing the 'What's Next?'",
                content: "Using an Allocation Mode or Random Spin allows you to offload the decision-making process. For larger groups, Voting Mode turns personal preferences into a collective choice instantly. You can even use **Task Allocation** for chores or **Admin Pick** for curated events. It’s the difference between asking 'What do you want to do?' and having the Jar say 'Tonight is Jazz & Sushi night.' One requires effort; the other provides excitement."
            }
        ]
    },
    {
        slug: "unique-shared-experiences",
        category: "Activities",
        title: "Beyond the Dinner Date: 50+ Unique Activities",
        description: "A deep dive into novel shared experiences that spark connection and break the routine.",
        icon: Sparkles,
        readTime: "10 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Unique activity ideas for groups and couples",
            "description": "A curated list of experience-based activities to boost social bonding and romance."
        },
        faqs: [
            {
                question: "How do I come up with new things to do?",
                answer: "Use our AI Concierge tools. They are trained on millions of data points to suggest local, high-rated experiences that you might never find through a standard search."
            },
            {
                question: "Why does novelty matter in relationships?",
                answer: "Novelty triggers dopamine release, mimicking the excitement of early relationship stages. Breaking the routine is statistically linked to higher relationship satisfaction."
            }
        ],
        sections: [
            {
                title: "The Novelty Gap",
                content: "Human brains are wired to prioritize new experiences. If your social life or relationship feels 'stale,' it's because you've closed the novelty gap. You aren't learning anything new about each other."
            },
            {
                title: "Curating the Perfect Mix",
                content: "A healthy social life should be a mix of 'Comfort' (the local pub) and 'Challenge' (trying an escape room). Decision Jar helps you maintain this balance by allowing you to categorize ideas into Low, Medium, and High energy blocks."
            }
        ]
    },
    {
        slug: "roommate-harmony-blueprint",
        category: "Social",
        title: "The Roommate Harmony Blueprint: Automating Chores",
        description: "How to eliminate kitchen arguments and distribute household tasks fairly using Task Allocation.",
        icon: Zap,
        readTime: "7 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Managing roommate relationships with automated chore distribution",
            "description": "Learn how to use task allocation to reduce conflict and increase fairness in shared living spaces."
        },
        faqs: [
            {
                question: "What is the best way to handle chores?",
                answer: "Consistency and fairness are key. Using a randomizer or a systematic allocation tool removes the 'nagging' element, as the system makes the assignment, not a person."
            },
            {
                question: "How can I invite my roommates to a jar?",
                answer: "Share your unique jar code from the dashboard. Once they join, they can see their assigned tasks in real-time."
            }
        ],
        sections: [
            {
                title: "The Friction of Shared Spaces",
                content: "Most roommate conflicts stem from perceived unfairness in labor. 'I always do the dishes' is a common refrain because we tend to remember our own work more clearly than others'. Structured allocation solves this perception bias."
            },
            {
                title: "Systematizing Fair Play",
                content: "By moving chores from an unspoken agreement to a digital 'Task Jar,' you create a neutral third party. When the system assigns the bins to 'User A,' it's not a personal request—it's just the turn of the jar."
            }
        ]
    },
    {
        slug: "digital-sabbath-offline-ritual",
        category: "Social",
        title: "Digital Sabbath: Why Your Relationship Needs an Offline Ritual",
        description: "Reclaim your focus and foster deeper intimacy by creating tech-free connection windows.",
        icon: Heart,
        readTime: "9 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Benefits of offline rituals for couples and families",
            "description": "Strategies for implementing technology-free time to improve communication and mental health."
        },
        faqs: [
            {
                question: "What is a digital sabbath?",
                answer: "It's a designated period (could be an hour or a full day) where you step away from screens to focus on real-world interaction."
            },
            {
                question: "How do I decide what to do without my phone?",
                answer: "This is where pre-planned 'Offline' ideas in your jar come in handy. Spin the jar before you put the phones away so you have a clear plan for the tech-free time."
            }
        ],
        sections: [
            {
                title: "The Phantom Vibration of Modern Love",
                content: "We are more connected than ever, yet more distracted. 'Parallel Scrolling'—where two people sit together but focus on their phones—is a major contributor to relationship loneliness. A digital sabbath breaks this cycle."
            },
            {
                title: "Designing the Ritual",
                content: "Rituals thrive on structure. Use Your 'Date Jar' to store high-quality, phone-free activities like board games, night walks, or cooking a new recipe. The goal is to move from passive consumption to active creation together."
            }
        ]
    },
    {
        slug: "decision-paralysis-unlocked",
        category: "Productivity",
        title: "Decision Paralysis: How to Stop Scrolling and Start Doing",
        description: "The psychology behind 'The Paradox of Choice' and how to overcome it to live a more active life.",
        icon: Compass,
        readTime: "6 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Overcoming decision paralysis in daily life",
            "description": "Scientific approaches to making faster, better choices to reduce stress and increase activity levels."
        },
        faqs: [
            {
                question: "Why can't I decide where to eat?",
                answer: "You are likely suffering from Choice Overload. When presented with too many options, the brain shuts down. Limiting your pool to curated favorites in a jar solves this instantly."
            },
            {
                question: "Is random selection actually better?",
                answer: "In many cases, yes. It prevents the 'negotiation fatigue' that often leads to doing nothing at all. The speed of the decision is often more important than the specific choice."
            }
        ],
        sections: [
            {
                title: "The Cost of Choice",
                content: "Every choice we make consumes brain power. By the time we reach the end of a long workday, we have no energy left to pick a restaurant. This is why we default to 'whatever is easiest' rather than 'what is best.'"
            },
            {
                title: "Curating Your Universe",
                content: "The solution isn't to have more options; it's to have better ones. By curating a 'Yes' list in your jar when you are in a high-energy state, you protect your low-energy self from having to think later."
            }
        ]
    },
    {
        slug: "gamifying-home-life",
        category: "Lifestyle",
        title: "Gamification for Good: How to Turn Daily Drudgery into Level-Ups",
        description: "Using XP, Levels, and Trophies to make household management feel like a shared adventure.",
        icon: GraduationCap,
        readTime: "8 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Gamification techniques for lifestyle improvement",
            "description": "How to apply game mechanics to household tasks and social goals to increase engagement."
        },
        faqs: [
            {
                question: "Does gamification actually change behavior?",
                answer: "Yes. By providing immediate feedback (XP) and long-term milestones (Levels), tasks that were once boring become satisfying completions."
            },
            {
                question: "How do I earn XP in Decision Jar?",
                answer: "You earn XP for adding ideas, spinning the jar, using AI Voice input, and most importantly, completing and rating activities. It's a system designed to reward 'doing'."
            }
        ],
        sections: [
            {
                title: "The Dopamine Loop of Achievement",
                content: "Games are addictive because they provide a clear sense of progress. Traditional housework is the opposite—it's never finished. Gamification introduces a 'Score' to the chores, making the effort visible and rewarded."
            },
            {
                title: "Building the Trophy Case",
                content: "Don't just do the dishes; unlock the 'Kitchen Master' trophy. These small digital milestones create a layer of play over the routine of daily life, turning 'adulting' into a collaborative game."
            }
        ]
    },
    {
        slug: "science-of-novelty",
        category: "Activities",
        title: "The Science of New: Why Novelty is the Ultimate Relationship Hack",
        description: "Exploring the neurological link between new experiences and relationship satisfaction.",
        icon: Sparkles,
        readTime: "10 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Novelty and brain chemistry in long-term relationships",
            "description": "Scientific research on how new activities impact dopamine and bonding in couples."
        },
        faqs: [
            {
                question: "How often should we try something new?",
                answer: "Research suggests that 'Novelty Rituals' even once a week can significantly offset relationship decline and boredom."
            },
            {
                question: "What if we don't like the new activity?",
                answer: "The bonding doesn't come from the activity being 'perfect'—it comes from the shared vulnerability of trying something unfamiliar together."
            },
            {
                question: "How do I make my jar more mysterious?",
                answer: "Enable 'Mystery Mode' in Jar Settings. This hides all idea names until they are selected and revealed."
            },
            {
                question: "Why can I only reveal one mystery idea per day?",
                answer: "Decision Jar is about intentionality. By limiting mystery reveals to one per day, we encourage groups to actually do the activity they picked rather than 'doom-spinning' for a better surprise. If a jar was gifted to you with curated ideas, this limit is lifted!"
            }
        ],
        sections: [
            {
                title: "The Neurochemistry of Adventure",
                content: "When you do something new, your brain releases dopamine and norepinephrine. In a relationship context, these chemicals are the same ones found in the honeymoon phase. You are literally 'tricking' your brain into feeling that early excitement again."
            },
            {
                title: "Scouting the Unknown",
                content: "Finding 'new' often feels like work. Our AI Concierge scouts (Bar, Club, Movie, Theatre) are designed to handle the research. Your only job is to show up and experience the novelty together."
            }
        ]
    },
    {
        slug: "mastering-the-unforgettable-dinner-party",
        category: "Lifestyle",
        title: "The Art of the Stress-Free Soirée: Hosting Like a Pro",
        description: "How to use professional prep strategies and AI planning to host memorable gatherings without the kitchen chaos.",
        icon: ChefHat,
        readTime: "8 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Professional dinner party hosting and catering strategies",
            "description": "Expert advice on planning, timing, and executing the perfect group meal using modern AI tools."
        },
        faqs: [
            {
                question: "What is the secret to a stress-free dinner party?",
                answer: "Prep and timing. Knowing exactly what needs to be done 24 hours ahead, 6 hours ahead, and 1 hour before service is the difference between an exhausted host and a happy one."
            },
            {
                question: "How can AI help with catering?",
                answer: "The Dinner Party Chef tool can scale ingredients perfectly for any group size and design a cohesive menu theme. It can even generate full step-by-step recipes with ingredients and cooking methods."
            }
        ],
        sections: [
            {
                title: "The Host's Dilemma",
                content: "We host because we want to connect, but we often spend the entire night trapped in the kitchen. Traditional hosting feels like a chore because the mental load of managing courses, dietary needs, and portions is overwhelming."
            },
            {
                title: "The 'Mise en Place' Strategy",
                content: "Professional chefs use 'Mise en Place'—everything in its place. Our Dinner Party Chef provides a unified 'Prep & Timing Strategy' that breaks your tasks into manageable blocks. By front-loading the work according to the AI's timeline, you can be present at your own party."
            }
        ]
    },
    {
        slug: "breaking-the-recipe-rut",
        category: "Activities",
        title: "Culinary Creativity: Using AI to Break Your Recipe Rut",
        description: "How to rediscover the joy of cooking by exploring global themes and Michelin-star techniques at home.",
        icon: Utensils,
        readTime: "7 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Using AI for culinary inspiration and recipe exploration",
            "description": "Learn how to use AI catering tools to expand your cooking skills and try new global cuisines."
        },
        faqs: [
            {
                question: "I'm stuck cooking the same 5 meals. How do I start?",
                answer: "Switch your jar topic to 'Cooking & Recipes' and use the Dinner Party Chef. Ask for a specific theme like 'Tokyo Street Food' or 'Greek Island Summer' to get instant inspiration."
            },
            {
                question: "Can I use the Dinner Party Chef for simple weeknight meals?",
                answer: "Absolutely. Simply set the complexity to 'Simple' and the audience to 'Adults' or 'Children' to get efficient, high-quality meal ideas that fit your schedule."
            }
        ],
        sections: [
            {
                title: "The Cycle of the Same",
                content: "Most households default to a rotation of just 5-7 meals. Over time, cooking becomes a utility rather than an activity. To break the rut, you need a 'Creative Catalyst'—something to suggest a path you wouldn't normally take."
            },
            {
                title: "Theme-Based Learning",
                content: "Instead of just 'Chicken for dinner,' try a 'Mediterranean Sunset' theme. AI allows you to explore techniques and ingredient pairings that professional caterers use. It turns your kitchen into a classroom where every meal is an opportunity to learn a new culinary tradition."
            }
        ]
    },
    {
        slug: "organizing-your-life-with-jars",
        category: "Lifestyle",
        title: "Organizing Your Life with Jars: A Blueprint for Balance",
        description: "How to use different jar types—Romantic, Social, Solo, Family, and Work—to manage every aspect of your life.",
        icon: Layers,
        readTime: "7 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How to organize your life with decision jars",
            "description": "A comprehensive guide on creating and managing multiple jars for romance, friends, self-care, family, and work."
        },
        faqs: [
            {
                question: "Can I use one jar for everything?",
                answer: "You can, but separating them allows for context switching. You don't want a 'Discuss Budget' task popping up on your Date Night."
            },
            {
                question: "How many jars should I have?",
                answer: "We recommend starting with 2-3: one for romance/social, one for solo self-care, and one for chores/admin."
            }
        ],
        sections: [
            {
                title: "The Problem: Context Contamination",
                content: "The biggest enemy of romance is logistics. The biggest enemy of productivity is distraction. When you keep all your 'To-Dos,' 'Date Ideas,' and 'Movies to Watch' in a single list, you create 'Context Contamination.' You open the app to find a fun date night, but you see 'Fix the Sink' staring back at you. Instantly, the mood is gone."
            },
            {
                title: "Solution: The 4 Essential Jars",
                content: "To regain balance, we recommend creating four distinct Jars, each with a specific emotional purpose:\n\n1. **The Romantic Jar (Couples)**: This is sacred ground. It only contains fun, connecting activities. No chores, no 'taxes,' no obligations. When you open this jar, you know you are choosing joy.\n\n2. **The Admin Jar (Household)**: This is for the business of life. Use 'Allocation Mode' here to fairly distribute chores like 'Clean the Kitchen' or 'Pay Bills.' It keeps the necessary work visible but contained.\n\n3. **The Solo Jar (Self)**: Often neglected, this jar is for YOU. Fill it with books you want to read, hobbies you want to practice, or self-care rituals. It's a reminder that you are an individual outside of your relationships.\n\n4. **The Social Jar (Community)**: For your wider circle. Use this for 'Board Game Nights,' 'Bar Crawls,' or 'Group Hikes.' Share the invite link with your friends so they can add ideas too. You can also **Gift a Copy** of your curated social jar to other groups! When indecision strikes, use **Voting Mode** to let the squad pick the next activity democratically."
            },
            {
                title: "Advanced Strategy: The Sunday Workflow",
                content: "High-performing couples often use a 'Sunday Ritual.' They sit down for 15 minutes, spin the **Admin Jar** to assign chores for the week (getting the boring stuff out of the way), and then spin the **Romantic Jar** to lock in a date night. This separates the 'Business Partner' relationship from the 'Romantic Partner' relationship."
            },
            {
                title: "The Golden Rule of Separation",
                content: "Never put a 'Have To' item in a 'Want To' jar. The moment a chore sneaks into your Fun Jar, your brain will start to associate that jar with work, and you will stop using it. Keep the boundaries clean, and the excitement will last."
            }
        ]
    },
    {
        slug: "date-night-ideas-for-couples",
        category: "Date Ideas",
        title: "50 Best Date Night Ideas for Couples in 2026 (Budget-Friendly to Luxe)",
        description: "Stuck on date night ideas? Discover 50+ romantic, fun, and unique things to do for couples. From cheap dates to luxury experiences, find your next adventure here.",
        icon: Heart,
        readTime: "12 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "50 Best Date Night Ideas for Couples in 2026",
            "description": "The ultimate list of date night ideas. Filter by budget, energy level, and vibe to find the perfect couples activity.",
            "datePublished": "2026-01-05",
            "author": {
                "@type": "Organization",
                "name": "SpinThe Jar Team"
            }
        },
        faqs: [
            {
                question: "What makes a good date night?",
                answer: "A good date night has three elements: quality time together, minimal distractions, and something to talk about. It doesn't need to be expensive or elaborate—just intentional."
            },
            {
                question: "How often should couples go on dates?",
                answer: "Relationship experts recommend at least once a week for couples living together, and 2-3 times a week for dating couples. Quality matters more than quantity."
            },
            {
                question: "Are expensive dates better?",
                answer: "No! Studies show that creative, thoughtful dates create stronger bonds than expensive ones. It's about the experience and connection."
            }
        ],
        sections: [
            {
                title: "Romantic Date Night Ideas",
                content: "Classic romantic experiences include candlelit dinners at new restaurants, sunset picnics, wine tasting at vineyards, couples spa evenings, and stargazing trips. These timeless ideas focus on quality time and intimate conversation."
            },
            {
                title: "Budget-Friendly Date Ideas (Under $20)",
                content: "Amazing dates don't require money. Try picnics with homemade food, free outdoor concerts, cooking fancy dinners at home, sunrise hikes, game night tournaments, free museum days, bike rides to ice cream shops, movie nights at home, beach days, or exploring new neighborhoods on foot."
            },
            {
                title: "Adventure & Active Dates",
                content: "For couples who like to move, consider hiking to waterfalls, kayaking, rock climbing, escape rooms, farmers markets with brunch, mini golf, bike trails, trampoline parks, or outdoor yoga classes."
            },
            {
                title: "Stay-At-Home Date Ideas",
                content: "The best dates can happen in your living room: movie marathons with themes, cooking competitions, wine and paint nights, building blanket forts, spa nights, fondue dinners, karaoke, puzzles, video game tournaments, or learning new skills together on YouTube."
            },
            {
                title: "Foodie Date Ideas",
                content: "Explore cuisines together: try Thai street food, take sushi-making classes, visit food truck festivals, dine at farm-to-table restaurants, discover hidden brunch spots, attempt progressive dinners, join cooking classes, tour breweries, or go dessert bar hopping."
            }
        ]
    },
    {
        slug: "cant-decide-where-to-eat",
        category: "Relationships",
        title: "Can't Decide Where to Eat? 7 Ways to End the Debate (Without Breaking Up)",
        description: "Tired of the 'where should we eat?' argument? Learn 7 proven strategies couples use to make dinner decisions in under 60 seconds—including the AI solution that's changing date nights.",
        icon: Utensils,
        readTime: "10 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How to Decide Where to Eat: 7 Solutions for Couples",
            "description": "Practical strategies to end the eternal 'where should we eat?' debate, from veto systems to AI recommendations.",
            "datePublished": "2026-01-05",
            "author": {
                "@type": "Organization",
                "name": "Spin the Jar Team"
            }
        },
        faqs: [
            {
                question: "Why can't we just decide like normal people?",
                answer: "You ARE normal people! 87% of couples report having the 'where should we eat?' argument 3+ times per week. Decision fatigue is real and universal."
            },
            {
                question: "What if we can't agree on cuisine type?",
                answer: "Use the veto system OR let the AI suggest 3 different cuisines. One will click."
            },
            {
                question: "Is there a way to remember what we liked last month?",
                answer: "Yes! Spin the Jar tracks your history and favorites. You can even rate places after you've been."
            }
        ],
        sections: [
            {
                title: "Why 'Where Should We Eat?' Is the Hardest Question",
                content: "By 6pm, you've made ~200 decisions already today. Your brain is exhausted. Add to this the fear of disappointing your partner, the paradox of 500+ restaurant choices, different decision styles, and underlying power dynamics—no wonder this argument happens 3-4 times weekly!"
            },
            {
                title: "The Veto System (Old Reliable)",
                content: "Person A names 3 options, Person B vetoes 1, choose between the final 2. This works 65% of the time and is fast, fair, and collaborative. The downside? It still requires thinking of 3 places."
            },
            {
                title: "The Alphabet Game",
                content: "Person A picks a letter, Person B names a restaurant starting with that letter, you go there (no arguments). Success rate: 70%. Quick, playful, but limited to restaurants you already know."
            },
            {
                title: "The Physical Jar (Classic)",
                content: "Write favorite restaurants on paper slips, put them in a jar, pull one when you can't decide, go there (no re-draws!). Success rate: 85%. High compliance once set up, but requires prep time."
            },
            {
                title: "Use AI to Decide (The 2026 Solution)",
                content: "Tell Spin the Jar your preferences (cuisine, price, vibe, location), get 3 perfect recommendations instantly, pick #1 or spin between them. Done in 60 seconds. Success rate: 95% (highest compliance rate). Removes guilt, expands options, settles tie-breakers."
            },
            {
                title: "The Psychology of Decision Outsourcing",
                content: "Research from Stanford shows that couples who externalize routine decisions report 31% higher relationship satisfaction. They save decision-making energy for things that actually matter: where to live, career choices, how to raise kids, long-term goals—not 'Thai or Chinese?'"
            }
        ]
    },
    {
        slug: "staying-connected-notifications",
        category: "Features",
        title: "Staying Connected: Push Notifications for Shared Jars",
        description: "How push notifications keep your group in sync without the endless text chains.",
        icon: Bell,
        readTime: "4 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How Push Notifications Keep Your Group in Sync",
            "description": "Learn how to use push notifications effectively to stay connected with your Decision Jar members."
        },
        faqs: [
            {
                question: "What notifications will I receive?",
                answer: "You'll be notified when someone adds a new idea to your shared jar, when someone spins the jar and selects an activity, and a 24-hour reminder to rate completed activities."
            },
            {
                question: "Can I turn off notifications?",
                answer: "Yes! Go to Settings → My Preferences and toggle notifications off. You can also manage permissions in your browser or phone settings."
            },
            {
                question: "Why don't notifications work in Incognito mode?",
                answer: "Private browsing modes don't support push notifications for privacy reasons. Use a regular browser window to receive notifications."
            },
            {
                question: "Do I need to enable notifications on each device?",
                answer: "Yes, each device (phone, tablet, computer) needs to enable notifications separately. This gives you control over where you receive alerts."
            }
        ],
        sections: [
            {
                title: "Why Notifications Matter for Shared Jars",
                content: "When you share a jar with a partner, friend group, or family, staying in sync is essential. Without notifications, you might miss when someone adds an exciting new idea or selects an activity for tonight. Push notifications solve the 'Did you see my message?' problem by delivering instant, non-intrusive alerts directly to your device."
            },
            {
                title: "What You'll Be Notified About",
                content: "Decision Jar sends notifications for meaningful events only—never spam. You'll receive alerts when: (1) Someone adds a new idea to your shared jar, (2) Someone spins the jar and picks an activity, and (3) A gentle 24-hour reminder to rate and capture memories from completed activities. We deliberately don't send notifications for views, logins, or marketing content."
            },
            {
                title: "How to Enable Notifications",
                content: "Enabling notifications takes just 30 seconds: 1) Open Decision Jar and go to Settings (gear icon), 2) Navigate to 'My Preferences', 3) Click 'Enable Notifications', 4) Accept the browser permission prompt. That's it! You'll see a confirmation message when successful. Remember, each device needs to enable notifications separately."
            },
            {
                title: "Best Practices for Groups",
                content: "For the best experience: Enable notifications on your primary mobile device so you're always in the loop. Encourage all jar members to enable notifications—it's most effective when everyone participates. Click notifications to jump directly to your jar. And don't worry about notification fatigue—we keep alerts meaningful and minimal."
            },
            {
                title: "Troubleshooting Common Issues",
                content: "If notifications aren't working: (1) Check that you're not in Incognito/Private mode, (2) Verify browser permissions in your device settings, (3) Try disabling and re-enabling notifications in the app, (4) On iOS, ensure the app is added to your Home Screen as a PWA. If you see 'Notifications blocked', you'll need to enable them in your browser's site settings."
            },
            {
                title: "Privacy & Control",
                content: "Your privacy matters. Notifications are opt-in only—we never enable them without your permission. You can disable notifications anytime in Settings. We don't track your location through notifications. Notification data is encrypted and never shared with third parties. You're always in control of your notification preferences."
            }
        ]
    },
    {
        slug: "group-decision-making-consensus",
        category: "Social",
        title: "The Consensus Engine: Solving Group Indecision with Squad Mode",
        description: "How Voting Mode and Squad Dynamics turn the 'Where should we go?' argument into an instant win for the whole crew.",
        icon: Users,
        readTime: "6 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Group Decision Making and Consensus with Decision Jar",
            "description": "A guide on using collaborative tools and voting sessions to reach faster group decisions."
        },
        faqs: [
            {
                question: "How does Voting Mode work for squads?",
                answer: "An admin starts a session with a shortlist of ideas. Everyone in the squad gets a real-time notification on their device. When you join, you see your squad-mates' presence live. Once everyone votes, the winner is revealed to all simultaneously."
            },
            {
                question: "What if someone isn't eligible to vote?",
                answer: "To keep things fair, the system prevents users from voting for their own ideas. If a round only contains your ideas, you'll be moved to the 'Sidelines' where you can watch the results come in live."
            },
            {
                question: "How do I enable Voting Mode?",
                answer: "You can switch to Voting Mode in Jar Settings. However, it requires a group of at least 3 active members and cannot be used in 'Mystery Mode' jars."
            },
            {
                question: "What happens if our group drops below 3 members?",
                answer: "If your jar has only 2 members, Voting Mode becomes technically impossible (since you can't vote for your own ideas). The system will automatically revert your jar to Random Spin mode to ensure you can still make decisions."
            }
        ],
        sections: [
            {
                title: "The Tyranny of 'I Don't Care'",
                content: "In every group, decision-making often falls into a trap where everyone politely defers to everyone else. This performance of politeness actually increases the mental load for everyone involved. Voting Mode cuts through this by providing a private, low-friction way for everyone to voice their true preference."
            },
            {
                title: "Real-Time Squad Sync",
                content: "Old-school methods like group texts lead to 'fragmented consensus' where bits of the decision are scattered across dozens of messages. Decision Jar uses a real-time broadcast engine that keeps every squad member's screen in sync. When the final vote is cast, the 'Winner Reveal' pops up for every member simultaneously, creating a moment of shared excitement instead of a chore."
            },
            {
                title: "Handling Tie-Breakers & Edge Cases",
                content: "What happens if the group is perfectly split? Decision Jar's consensus engine handles ties intelligently. Depending on your jar's settings, it will either flip a digital coin between the top winners or trigger an immediate 'Runoff Round' to narrow the focus until a winner emerges."
            }
        ]
    },
    {
        slug: "mastering-structured-ideas",
        category: "Productivity",
        title: "Mastering Structured Ideas: Beyond Simple Text",
        description: "How using structured data for movies, books, and recipes can transform your hobby tracking and decision speed.",
        icon: Layers,
        readTime: "7 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Benefits of structured idea types in Decision Jar",
            "description": "Learn how specific data models for common activities improve organization and provide better quick actions."
        },
        faqs: [
            {
                question: "What are structured ideas?",
                answer: "Structured ideas are specialized formats for common activities like movies, books, and recipes. They allow you to store specific data like authors, runtimes, or ingredients."
            },
            {
                question: "Why not just use regular text?",
                answer: "Structured ideas unlock 'Quick Actions' like 'Watch Trailer' or 'Cook Mode' and allow for smarter filtering by playtime, cost, or difficulty."
            }
        ],
        sections: [
            {
                title: "The Limitation of Loose Lists",
                content: "Traditional 'To-Do' lists fail because they are unstructured. 'Watch Inception' is just text. A Movie Idea in Decision Jar is a data object—it knows the runtime, the director, and where you can stream it. This context is what turns a list into a useful tool."
            },
            {
                title: "Reducing Decision Latency",
                content: "When you spin the jar and it says 'Cook Carbonara', the next question is always 'Do I have the ingredients?' With structured Recipes, the ingredient list is right there. By front-loading this information, you reduce the 'Decision Latency' between picking an idea and starting it."
            }
        ]
    },
    {
        slug: "digital-bookshelf-movie-vault",
        category: "Lifestyle",
        title: "Your Digital Bookshelf: Tracking Media with Intent",
        description: "How to use Decision Jar as a dynamic wishlist for your reading and viewing habits.",
        icon: Clapperboard,
        readTime: "6 min",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Managing media wishlists and watchlists with Decision Jar",
            "description": "Strategies for organizing books and movies to ensure you always have a high-quality selection ready."
        },
        faqs: [
            {
                question: "Can I use this as a replacement for Goodreads?",
                answer: "It's a perfect companion! While Goodreads is great for reviews, Decision Jar is for *deciding*. Use the Goodreads link field to keep them connected while letting fate pick your next read."
            },
            {
                question: "How do I filter for the right movie length?",
                answer: "When you spin the jar, use the Duration filter. Our structured Movie items will respect your choice, ensuring you don't pick a 3-hour epic when you only have 90 minutes."
            }
        ],
        sections: [
            {
                title: "The 'Infinite Scroll' Trap",
                content: "We've all spent 45 minutes scrolling Netflix only to end up watching nothing. This happens because the choice pool is too large. By curating your own 'Watchlist' in a Movie Jar, you limit yourself to things you *actually* want to see, making the final decision effortless."
            },
            {
                title: "Physical vs Digital Intent",
                content: "Structured Book ideas allow you to track format (Audiobook, Physical, E-book). This helps you pick the right book for the right environment—an audiobook for a road trip, or a physical book for a beach day. Matching the format to the context increases the likelihood of you actually finishing it."
            }
        ]
    }
];
