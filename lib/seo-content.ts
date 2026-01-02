import { LucideIcon, Users, Brain, Sparkles, Zap, MessageSquare, Compass, Heart, GraduationCap } from "lucide-react";

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
                answer: "Decision fatigue and the 'Paradox of Choice' often lead to groups never meeting. Structured random selection or voting sessions solve this instantly."
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
                content: "Using an Allocation Mode or Random Spin allows you to offload the decision-making process. It’s the difference between asking 'What do you want to do?' and having the Jar say 'Tonight is Jazz & Sushi night.' One requires effort; the other provides excitement."
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
    }
];
