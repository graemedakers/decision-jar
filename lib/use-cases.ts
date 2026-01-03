import { Heart, Users, Briefcase, User, Film, Dumbbell, Plane, Smile, Utensils, Megaphone, Shield, Key, Trophy } from "lucide-react";

export interface UseCaseStep {
    title: string;
    description: string;
}

export interface UseCase {
    slug: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    steps: {
        create: UseCaseStep;
        invite: UseCaseStep;
        add: UseCaseStep;
        choose: UseCaseStep;
    };
    cta: string;
    jarType: string; // For the "Create This Jar" button integration later
}

export const USE_CASES: UseCase[] = [
    {
        slug: "couples-date-night",
        title: "The Romantic Spark",
        description: "Keep the flame alive with spontaneous date nights and zero decision fatigue.",
        icon: Heart,
        color: "text-rose-500",
        jarType: "ROMANTIC",
        cta: "Start Your Date Jar",
        steps: {
            create: {
                title: "Create a 'Romantic' Jar",
                description: "Sign up and select 'Romantic' as your jar type. This optimizes the AI for date ideas and sets a lovely theme."
            },
            invite: {
                title: "Invite Your Partner",
                description: "Share the unique invite code with your significant other. Once they join, you both have equal access to add and spin."
            },
            add: {
                title: "Fill It With Love",
                description: "Both of you add ideas! From 'Fancy Dinner' to 'Movie Marathon'. Use the 'Surprise Me' button to let AI suggest romantic spots nearby."
            },
            choose: {
                title: "Spin for Date Night",
                description: "Can't decide? Set filters (e.g., 'Indoor', '$$') and spin the jar. Whatever it lands on, you commit to doing!"
            }
        }
    },
    {
        slug: "family-weekend",
        title: "The Family Adventure",
        description: "Stop the 'I'm bored' complaints. Make weekends exciting for the whole family.",
        icon: Users,
        color: "text-blue-500",
        jarType: "SOCIAL",
        cta: "Create a Family Jar",
        steps: {
            create: {
                title: "Create a 'Social' Jar",
                description: "Name it 'The [Surname] Family' and choose 'Social' mode. This supports multiple members."
            },
            invite: {
                title: "Add the Family",
                description: "Invite your partner and kids (if they have devices). For younger kids, just manage the jar on the parents' phones."
            },
            add: {
                title: "Crowdsource Fun",
                description: "Let everyone add their wishlist. 'Zoo Trip', 'Bike Ride', 'Board Game Night'. Use tags like 'Outdoor' or 'Rainy Day' to organize."
            },
            choose: {
                title: "The Weekend Ritual",
                description: "Every Saturday morning, gather around the phone and spin. The anticipation is half the fun!"
            }
        }
    },
    {
        slug: "office-lunch",
        title: "The Office Lunch",
        description: "Solve the daily 'Where should we eat?' debate with your coworkers.",
        icon: Briefcase,
        color: "text-slate-600",
        jarType: "SOCIAL",
        cta: "Create Team Jar",
        steps: {
            create: {
                title: "Create a Team Jar",
                description: "Set up a Social Jar named 'Team Lunch'. Set custom categories like 'Fast Food', 'Sit Down', 'Pub'."
            },
            invite: {
                title: "Share the Link",
                description: "Post the invite code in your team Slack or Teams channel. Anyone can join and contribute."
            },
            add: {
                title: "Build the Menu",
                description: "Add all the local haunts. Tag them by price ($ or $$) and distance/walking time."
            },
            choose: {
                title: "Spin Before You Starve",
                description: "At 11:55 AM, someone hits spin. No arguments, just go. If it picks the salad place again, so be it!"
            }
        }
    },
    {
        slug: "solo-explorer",
        title: "The Solo Explorer",
        description: "Break your routine. Force yourself to try new things and visit new places.",
        icon: User,
        color: "text-emerald-500",
        jarType: "GENERIC",
        cta: "Start Exploring",
        steps: {
            create: {
                title: "Create a Personal Jar",
                description: "This is just for you. Choose 'General' topic to keep it flexible."
            },
            invite: {
                title: "Solo Mission",
                description: "No invites needed! This is your personal bucket list and bravery trainer."
            },
            add: {
                title: "Curate Experiences",
                description: "Add things you've always wanted to do but never make time for. 'Visit Art Gallery', 'Read in the Park', 'Try that new Jazz Bar'."
            },
            choose: {
                title: "Challenge Yourself",
                description: "When you have free time, spin. If it lands on 'Go to a Museum', you go. Treat it like a quest."
            }
        }
    },
    {
        slug: "movie-buffs",
        title: "The Movie Buffs",
        description: "A watchlist that actually gets watched. Perfect for friends or roommates.",
        icon: Film,
        color: "text-purple-500",
        jarType: "SOCIAL",
        cta: "Start Watching",
        steps: {
            create: {
                title: "Create a 'Movies' Jar",
                description: "Select the 'Movies' topic. The jar will now expect film titles and streaming services."
            },
            invite: {
                title: "Gather the Critics",
                description: "Invite your roommates or movie-night crew."
            },
            add: {
                title: "Build the Queue",
                description: "Add movies as you hear about them. Use details to note 'Netflix', 'Hulu', or 'Theaters'."
            },
            choose: {
                title: "Press Play",
                description: "Friday night? Spin. Filter by 'Comedy' or 'Horror' if your custom categories are set up, or just let fate decide the genre."
            }
        }
    },
    {
        slug: "fitness-challenge",
        title: "The Fitness Challenge",
        description: "Gamify your workouts. Don't let your gym routine get stale.",
        icon: Dumbbell,
        color: "text-orange-500",
        jarType: "GENERIC",
        cta: "Get Moving",
        steps: {
            create: {
                title: "Create a Fitness Jar",
                description: "Set the topic to 'Fitness'. This helps the AI suggest relevant workouts."
            },
            invite: {
                title: "Workout Buddy (Optional)",
                description: "Great for solo training or gym partners. Invite your spotter to keep you both accountable."
            },
            add: {
                title: "List Your Workouts",
                description: "Add specific routines: 'Leg Day A', '5k Run', 'Yoga Class', 'HIIT Circuit'."
            },
            choose: {
                title: "Spin for Sweat",
                description: "Feeling unmotivated? Let the jar pick your workout. The element of surprise triggers a dopamine hit before you even start sweating."
            }
        }
    },
    {
        slug: "travel-bucket-list",
        title: "The Traveler's Compass",
        description: "Plan your next getaway. Put your dream destinations in a jar.",
        icon: Plane,
        color: "text-sky-500",
        jarType: "ROMANTIC",
        cta: "Plan Your Trip",
        steps: {
            create: {
                title: "Create a Travel Jar",
                description: "Set the topic to 'Travel'. This is great for long-term planning."
            },
            invite: {
                title: "Travel Companions",
                description: "Invite whoever you travel with. Spouse, best friend, or huge group for a bachelor trip."
            },
            add: {
                title: "Dream Big",
                description: "Add destinations: 'Japan', 'Iceland', 'Road Trip to Grand Canyon'. Add details about costs and best seasons."
            },
            choose: {
                title: "The Next Adventure",
                description: "When it's time to book holidays, spin the jar. If it lands on 'Italy', start looking at flights!"
            }
        }
    },
    {
        slug: "boredom-buster",
        title: "The Boredom Buster",
        description: "For kids, students, or anyone stuck in a rut. Instant entertainment.",
        icon: Smile,
        color: "text-yellow-500",
        jarType: "GENERIC",
        cta: "Bust Boredom",
        steps: {
            create: {
                title: "Create an Activity Jar",
                description: "A simple, general jar for moments of 'I don't know what to do'."
            },
            invite: {
                title: "Keep it Simple",
                description: "Usually for parents managing kids, or just for yourself."
            },
            add: {
                title: "Low-Stakes Fun",
                description: "Add easy activities: 'Draw a picture', 'Build Lego', 'Call Grandma', 'Clean your room' (maybe sneak that one in)."
            },
            choose: {
                title: "Instant Cure",
                description: "When boredom strikes, spin. The rule is you HAVE to do it for at least 15 minutes."
            }
        }
    },
    {
        slug: "dinner-dilemma",
        title: "The Dinner Dilemma",
        description: "Home cooking made easy. Decide your weekly meal plan in seconds.",
        icon: Utensils,
        color: "text-red-500",
        jarType: "GENERIC",
        cta: "Get Cooking",
        steps: {
            create: {
                title: "Create a Recipe Jar",
                description: "Set topic to 'Food'. Dedicated to home-cooked meals."
            },
            invite: {
                title: "Household Chef",
                description: "Share with whoever does the grocery shopping."
            },
            add: {
                title: "Family Favorites",
                description: "Add your repertoire: 'Spaghetti Bolognese', 'Tacos', 'Stir Fry'. Link to online recipes in the details."
            },
            choose: {
                title: "Meal Prep Roulette",
                description: "Spin 7 times on Sunday to plan the whole week's menu. Grocery list = done."
            }
        }
    },
    {
        slug: "community-curator",
        title: "The Community Curator",
        description: "Build a following. Create a public jar for 'Best Coffee in Seattle' and share it.",
        icon: Megaphone,
        color: "text-indigo-500",
        jarType: "SOCIAL",
        cta: "Start Your Community",
        steps: {
            create: {
                title: "Create a Community Jar",
                description: "Mark your jar as a 'Community Jar' during creation. Give it a catchy name like 'Hidden Gems of [City]'."
            },
            invite: {
                title: "Go Public",
                description: "You get a public link. Share it on Instagram, TikTok, or your blog. Anyone can view instructions, only you can edit."
            },
            add: {
                title: "Curate Quality",
                description: "You are the influencer. Add only the best spots. Your followers trust your taste."
            },
            choose: {
                title: "Fan Interaction",
                description: "Followers use your jar to decide where to go. They get your expertise, gamified."
            }
        }
    },
    {
        slug: "chore-master",
        title: "The Chore Master",
        description: "End the arguments over who does what. Fairly distribute family or roommate chores.",
        icon: Shield,
        color: "text-emerald-500",
        jarType: "SOCIAL",
        cta: "Allocate Tasks",
        steps: {
            create: {
                title: "Create an Allocation Jar",
                description: "Select 'Task Allocation' as your selection mode. This enables the private task distribution engine."
            },
            invite: {
                title: "Invite the Household",
                description: "Share the code with roommates or family members. Everyone needs to be in the jar before allocation starts."
            },
            add: {
                title: "List the Chores",
                description: "Add everything that needs doing: 'Vacuuming', 'Dishes', 'Bins', 'Mow Lawn'. Use details for specific instructions."
            },
            choose: {
                title: "Automated Distribution",
                description: "Administrators click 'Distribute Tasks'. Choose how many chores per person, and the jar assigns them randomly. No more picking favorites!"
            }
        }
    },
    {
        slug: "escape-the-room",
        title: "The Puzzle Masters",
        description: "Organize an escape room challenge for your friends or team.",
        icon: Key,
        color: "text-amber-500",
        jarType: "SOCIAL",
        cta: "Find an Escape Room",
        steps: {
            create: {
                title: "Use Escape Scout",
                description: "Open the Executive Decision Suite on the dashboard and select 'Escape Room Scout'."
            },
            invite: {
                title: "Gather the Squad",
                description: "Escape rooms are best with 4-6 people. Invite your smartest friends."
            },
            add: {
                title: "Choose the Vibe",
                description: "Filter by 'Horror' for scares or 'Heist' for action. Set your difficulty level."
            },
            choose: {
                title: "Book It",
                description: "Review top-rated rooms nearby and use the direct link to book your slot."
            }
        }
    },
    {
        slug: "sports-buddies",
        title: "The Weekend Athlete",
        description: "Find a regular tennis court, golf course, or pickup basketball game.",
        icon: Trophy,
        color: "text-emerald-500",
        jarType: "GENERIC",
        cta: "Find Sports Clubs",
        steps: {
            create: {
                title: "Use Sports Scout",
                description: "Open the Dashboard and select 'Sports Scout'."
            },
            invite: {
                title: "Find a Partner",
                description: "Invite a friend to your jar to share these locations."
            },
            add: {
                title: "Filter by Sport",
                description: "Select 'Tennis', 'Golf', or 'Swimming'. You can even filter for 'Public Access' only."
            },
            choose: {
                title: "Hit the Court",
                description: "Find the best facility near you, check if they are open, and go play!"
            }
        }
    }
];
