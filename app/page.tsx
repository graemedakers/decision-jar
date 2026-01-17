"use client";

import { Jar3D } from "@/components/Jar3D";
import { Button } from "@/components/ui/Button";
import { Heart, Sparkles, Calendar, Utensils, Wine, Shuffle, Users, ArrowRight, Star, CheckCircle2, User, Brain, Disc, Clapperboard, Bed, Leaf, Dumbbell, Ticket, Key, Book, Menu, ChefHat, Gamepad2, Trophy, Plane } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PRICING } from "@/lib/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { TemplateGallery } from "@/components/TemplateGallery";

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 flex flex-col items-start gap-4 hover:bg-white/60 dark:hover:bg-white/10 transition-colors group"
    >
      <div className="p-3 rounded-xl bg-primary/10 dark:bg-white/5 group-hover:bg-primary/20 dark:group-hover:bg-white/10 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 relative z-10">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary/25">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-white/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className="text-lg font-medium text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors">{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-white" style={{ transform: 'rotate(90deg)' }} />
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const [reviews, setReviews] = useState<any[]>([]);

  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check login status & Fetch Reviews
  React.useEffect(() => {
    // Immediate check for session cookie to prevent flash of landing page for logged-in users
    if (typeof document !== 'undefined' && document.cookie.includes('session=')) {
      setIsRedirecting(true);
    }

    // Auth check
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          router.replace('/dashboard'); // Use replace to specific history stack
        } else {
          setIsRedirecting(false); // No user found, show landing page
        }
      })
      .catch(err => {
        console.error("Auth check failed:", err);
        setIsRedirecting(false);
      });

    // Fetch Reviews
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(err => console.error("Failed to fetch reviews:", err));
  }, [router]);

  if (isRedirecting) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Jar3D />
          </div>
          <p className="text-slate-400 animate-pulse">Resuming session...</p>
        </div>
      </main>
    );
  }

  // Calculate rating for Schema
  const ratingValue = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';
  const ratingCount = reviews.length > 0 ? reviews.length.toString() : '120';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Spin the Jar',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: PRICING.CURRENCY,
    },
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://spinthejar.com',
    description: 'A fun, interactive way for couples and friends to decide on their next date or hangout.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      ratingCount: ratingCount,
    },
    featureList: 'AI Date Planner, Group Decision Making, Shared Jars, Random Activity Picker, Weekend Itinerary Builder, Restaurant Finder, Event Scout',
    applicationSubCategory: 'Social Networking',
    permissions: 'internet',
    screenshot: `${process.env.NEXT_PUBLIC_APP_URL || 'https://spinthejar.com'}/og-image.jpg`,
    availableOnDevice: ['iOS', 'Android', 'Desktop'],
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does the idea generator work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Simply add your own ideas or use our pre-filled categories. When you're ready, filter by budget, time, or energy level, and 'Spin the Jar' to get a random suggestion that fits your mood perfectly."
          }
        },
        {
          '@type': 'Question',
          name: 'Is Spin the Jar free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! You can create up to 3 jars, add unlimited ideas, and sync with your group for free. Premium features like AI planning require a subscription.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does it work for roommates and friend groups?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. Use Social mode for friends or Task Allocation mode for roommates to distribute chores fairly.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is my data secure and private?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Your jars are private by default. Only people with your unique invite code can join. We use industry-standard encryption to protect your data.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I use it on iPhone and Android?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Decision Jar is a Progressive Web App. You can add it to your home screen on any mobile device for a native-like experience.'
          }
        }
      ]
    }
  };

  return (
    <main ref={containerRef} className="min-h-screen relative overflow-hidden bg-background w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ... existing background ... */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 dark:bg-accent/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-secondary/5 dark:bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      {/* ... nav ... */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <Image src="/icon.png" alt="Spin the Jar App Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight whitespace-nowrap">Spin the Jar</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/guide" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              How it Works
            </Link>
            <Link href="/learn" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              Learning Center
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Button onClick={() => router.push('/dashboard')} size="sm" className="bg-slate-200/50 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border-none text-slate-800 dark:text-white">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Button onClick={() => router.push('/demo')} size="sm" className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 border-none whitespace-nowrap">
                    Try Demo
                  </Button>
                  <Button onClick={() => router.push('/signup')} size="sm" variant="outline" className="hidden lg:flex">
                    Sign Up Free
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-3">
            {!user && (
              <Button onClick={() => router.push('/demo')} size="sm" className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 border-none text-xs h-8 px-3 whitespace-nowrap">
                Try Demo
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 -mr-2 text-slate-700 dark:text-slate-200" suppressHydrationWarning>
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                {user ? (
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer font-medium">
                    Go to Dashboard
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/login')} className="cursor-pointer">
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/signup')} className="cursor-pointer font-medium text-primary">
                      Sign Up Free
                    </DropdownMenuItem>
                  </>
                )}
                <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />
                <DropdownMenuItem onClick={() => router.push('/guide')} className="cursor-pointer">
                  How it Works
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/learn')} className="cursor-pointer">
                  Learning Center
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* ... Hero ... */}
      <section className="relative pt-20 pb-6 md:pt-40 md:pb-32 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 md:gap-12 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-5 md:space-y-8 text-center md:text-left w-full"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-sm font-medium text-pink-600 dark:text-pink-400">
              <Sparkles className="w-4 h-4" />
              <span>Your Personal AI Activity Concierge</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] break-words">
              Never Waste<br />
              30 Minutes<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
                Deciding Where to Eat
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto md:mx-0 leading-relaxed">
              Your <strong className="text-slate-800 dark:text-white">AI-powered decision maker</strong> for date nights, friend hangs, and family adventures.
              We find perfect places to go, you spin to decide. <strong className="text-slate-800 dark:text-white">No more arguments.</strong> No more analysis paralysis.
            </p>

            {/* Value Props */}
            <div className="flex flex-col gap-3 text-left max-w-xl mx-auto md:mx-0">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span><strong>AI finds hidden gems</strong> based on your mood & preferences</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Shuffle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span><strong>Spin the jar</strong> when you can't choose—let fate decide</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span><strong>Share jars</strong> with your partner, friends, or family</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Button
                onClick={() => router.push(user ? '/dashboard' : '/demo')}
                className="h-14 px-8 text-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border-none shadow-xl shadow-pink-500/25 w-full sm:w-auto"
              >
                {user ? "Go to Dashboard" : "Try Free Demo"} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => router.push(user ? '/dashboard' : '/signup')}
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 w-full sm:w-auto"
              >
                {user ? "Dashboard" : "Sign Up Free"}
              </Button>
            </div>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-xs text-white shadow-md">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Join <strong className="text-slate-800 dark:text-white">{reviews.length > 50 ? reviews.length + "+" : "500+"} couples</strong> making decisions effortlessly
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative h-[200px] md:h-[600px] flex items-center justify-center -my-4 md:my-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-[120px] animate-pulse-glow" />
            <div className="scale-[0.6] md:scale-150 relative z-10">
              <Jar3D />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Template Gallery */}
      <TemplateGallery isAuthenticated={!!user} />

      {/* ... Features ... */}
      <section id="features" className="py-24 px-6 relative z-10 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-white">The Toolkit for <br /><span className="text-primary dark:text-accent">Getting Things Done</span></h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We've evolved beyond just dates. Spin the Jar is now a powerful decision engine for your entire life, packed with AI tools to help you plan, organize, and experience more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Core Features */}
            <FeatureCard
              icon={Shuffle}
              title="Spin the Jar"
              description="Overcome decision paralysis. Filter by cost, duration, or vibe and let fate decide your next adventure."
              delay={0.1}
            />
            <FeatureCard
              icon={Users}
              title="Sync & Collaborate"
              description="Perfect for couples, roommates, and groups. Invite friends to a shared jar and sync ideas instantly across devices."
              delay={0.15}
            />

            {/* Planning Tools */}
            <FeatureCard
              icon={Sparkles}
              title="AI Concierge"
              description="Your personal genius. Ask for any specific idea - from 'quiet places to study' to 'unique anniversary gifts' - and get instant, tailored recommendations."
              delay={0.2}
            />
            <FeatureCard
              icon={Calendar}
              title="Weekend Planner"
              description="Maximize your free time. Our smart AI finds live events, markets, and festivals happening right now in your city."
              delay={0.25}
            />
            <FeatureCard
              icon={Heart}
              title="Date Night Planner"
              description="Plan a complete evening out. Combining dinner, drinks, and activities into a seamless itinerary for you and your partner."
              delay={0.3}
            />
            <FeatureCard
              icon={Plane}
              title="Holiday Planner"
              description="Travel smarter. Create a complete travel itinerary with transport, dining, and activities for your next trip."
              delay={0.35}
            />

            {/* Food & Drink */}
            <FeatureCard
              icon={Utensils}
              title="Dining Concierge"
              description="Stop scrolling food apps. Get curated restaurant recommendations based on cuisine, vibe, and dietary needs in seconds."
              delay={0.4}
            />
            <FeatureCard
              icon={Wine}
              title="Bar Scout"
              description="Find the perfect watering hole. From hidden speakeasies and rooftop bars to cozy pubs and wine lounges."
              delay={0.45}
            />
            <FeatureCard
              icon={Disc}
              title="Nightlife Navigator"
              description="Own the night. Discover top-rated clubs, dance venues, and late-night spots to keep the party going."
              delay={0.5}
            />
            <FeatureCard
              icon={ChefHat}
              title="Dinner Party Chef"
              description="Host like a pro. Generate custom menus and recipes for dinner parties, date nights in, or family feasts."
              delay={0.55}
            />

            {/* Entertainment */}
            <FeatureCard
              icon={Clapperboard}
              title="Movie Picker"
              description="End the streaming scroll. Find the perfect movie in theaters or on streaming services based on your mood."
              delay={0.6}
            />
            <FeatureCard
              icon={Book}
              title="Book Finder"
              description="Discover your next read. Curated book recommendations filtered by genre, era, and emotional vibe."
              delay={0.65}
            />
            <FeatureCard
              icon={Ticket}
              title="Theatre & Arts"
              description="Get some culture. Discover plays, musicals, art exhibitions, and live performances happening nearby."
              delay={0.7}
            />
            <FeatureCard
              icon={Key}
              title="Escape Room Scout"
              description="Unlock the fun. Find highly-rated escape rooms nearby based on themes like Horror, Mystery, or Heist."
              delay={0.72}
            />
            <FeatureCard
              icon={Gamepad2}
              title="Game Guru"
              description="Level up your social plans. Find board game cafes, arcades, and gaming venues for a fun group outing."
              delay={0.75}
            />

            {/* Lifestyle */}
            <FeatureCard
              icon={Bed}
              title="Staycation Finder"
              description="Find the perfect getaway. Discover top-rated hotels and resorts for a local staycation or weekend trip."
              delay={0.78}
            />
            <FeatureCard
              icon={Leaf}
              title="Wellness & Spa"
              description="Relax and recharge. Locate the best spas, yoga studios, and wellness centers for some much-needed self-care."
              delay={0.8}
            />
            <FeatureCard
              icon={Dumbbell}
              title="Fitness Finder"
              description="Get moving. Find gyms, hiking trails, rock climbing, and fitness classes wherever you are."
              delay={0.82}
            />
            <FeatureCard
              icon={Trophy}
              title="Sports Finder"
              description="Get in the game. Find places to watch the big match or courts and fields to play your favorite sports."
              delay={0.85}
            />

            <FeatureCard
              icon={Star}
              title="The Vault"
              description="Keep a digital scrapbook. Rate your experiences, upload photos, and cherish every moment."
              delay={0.9}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {reviews.length > 0 && (
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">Users Love Spin the Jar</h2>
              <p className="text-slate-600 dark:text-slate-400">See what users are saying.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 flex flex-col gap-4"
                >
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic">"{review.comment}"</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{review.user?.name || "Spin the Jar User"}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ... How It Works ... */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">How It Works</h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-12">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0" />

            <StepCard
              number="1"
              title="Create Your Jar"
              description="Sign up and create a digital jar. Add your favorite activities or use our generator to find fresh ideas."
            />
            <StepCard
              number="2"
              title="Invite Friends"
              description="Send a unique invite code to your friends, family, or partner so you can all contribute and spin the jar together."
            />
            <StepCard
              number="3"
              title="Spin & Go"
              description="When it's time to decide, spin the jar to pick an activity. Say goodbye to indecision!"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Start for free and upgrade when you're ready for more advanced planning tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Starter Tier */}
            <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Free Starter</h3>
                <p className="text-slate-600 dark:text-slate-400">Perfect for couples, roommates, or small groups</p>
              </div>
              <div className="mb-8 space-y-2">
                <div>
                  <span className="text-4xl font-bold text-slate-800 dark:text-white">Free</span>
                  <span className="text-slate-500 dark:text-slate-400">/forever</span>
                </div>
                <div className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full inline-block mt-2">
                  🎁 Auto-starts with 14 days of Pro
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "3 Active Jars Included",
                  "Up to 4 Members/Jar",
                  "Unlimited Idea Capacity",
                  "Automatic 14-Day Pro Trial",
                  "Standard Categories"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-accent shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => router.push('/signup')}
                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border-0"
              >
                Get Started
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="glass-card p-8 rounded-3xl border border-primary/50 relative overflow-hidden flex flex-col hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                RECOMMENDED
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Spin the Jar Pro</h3>
                <p className="text-slate-600 dark:text-slate-400">For the ultimate social life</p>
              </div>
              <div className="mb-8 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-800 dark:text-white">{PRICING.MONTHLY}</span>
                  <span className="text-lg text-slate-400 line-through decoration-primary/50">{PRICING.ORIGINAL_MONTHLY}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">/month</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-primary text-white text-[10px] font-black uppercase tracking-wider w-fit animate-pulse">
                    ⚡ Limited Time Launch Offer
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    or <strong className="text-slate-900 dark:text-white">{PRICING.LIFETIME}</strong> Lifetime
                  </div>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Full Premium Suite Access",
                  "Unlimited Jars & Members",
                  "All AI Planners & Concierges",
                  "Custom Itinerary Builder",
                  "Cloud Memory Storage",
                  "Excl. Community Jar Hosting"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => router.push('/signup')}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 border-0"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ... FAQ ... */}
      <section className="py-24 px-6 bg-slate-50/50 dark:bg-slate-950/50 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Common <br />Questions.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                Everything you need to know about the app, the community, and how we handle your decisions.
              </p>
              <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
                <h4 className="font-bold text-primary mb-2">Still have questions?</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Our Learning Center has deep-dive guides on social connection and more.</p>
                <Link href="/learn">
                  <Button variant="outline" className="w-full bg-white dark:bg-slate-900 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all">
                    Visit Learning Center
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">The Basics</h3>
                <div className="glass-card p-2 md:p-4 space-y-1">
                  <FaqItem
                    question="How does the decision maker work?"
                    answer="Simply add your own ideas or use our pre-filled categories. When you're ready, filter by budget, time, or energy level, and 'Spin the Jar' to get a random suggestion that fits your mood perfectly."
                  />
                  <FaqItem
                    question="Is Spin the Jar free?"
                    answer="Yes! You can create up to 3 active jars, add unlimited ideas, and sync with your partner or friends for free. We offer a Pro tier for those who want AI tools and advanced conciliere features."
                  />
                  <FaqItem
                    question="Does it work on iPhone and Android?"
                    answer="Yes! It's a web-based app that works on any browser. For the best experience, open it on your phone and 'Add to Home Screen' to use it like a native app."
                  />
                </div>
              </div>

              <div className="space-y-2 pt-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Features & Modes</h3>
                <div className="glass-card p-2 md:p-4 space-y-1">
                  <FaqItem
                    question="What is Task Allocation mode?"
                    answer="Allocation mode is built for shared responsibilities. You can create a list of tasks (like chores) and the app will randomly distribute them among members evenly."
                  />
                  <FaqItem
                    question="How do Community Jars work?"
                    answer="Community Jars are public collections you can discover and join. While anyone can join for free, creating and hosting a public Community Jar requires a separate annual hosting fee for the organizer."
                  />
                  <FaqItem
                    question="Can I save memories?"
                    answer="Yes! Every time you complete an activity from the jar, it's moved to 'The Vault'. There you can rate the experience, add private notes, and upload up to 3 photos to preserve the memory."
                  />
                </div>
              </div>

              <div className="space-y-2 pt-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Privacy & Security</h3>
                <div className="glass-card p-2 md:p-4 space-y-1">
                  <FaqItem
                    question="Is my data private?"
                    answer="By default, all personal and social jars are 100% private. Only those with your unique invite code can see your ideas. We do not sell your data or use your private collections for training AI."
                  />
                  <FaqItem
                    question="Can I delete my account?"
                    answer="Yes. You have full control over your data. You can delete your jars or your entire account at any time from the settings menu."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ... CTA ... */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-3xl blur-2xl opacity-20" />
          <div className="glass-card p-12 rounded-3xl text-center relative overflow-hidden border-slate-200 dark:border-white/10">
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">Ready to make better decisions?</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Join thousands of people who are making better decisions, more often. It's free to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => router.push('/signup')}
                  className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-200 border-none w-full sm:w-auto"
                >
                  Create Your First Jar Now
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" /> Free {PRICING.TRIAL_DAYS}-day trial of premium features</span>
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" /> Then just {PRICING.MONTHLY} / month (Launch Offer!)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-md overflow-hidden">
              <Image src="/icon.png" alt="Spin the Jar App Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-slate-600 dark:text-slate-400">Spin the Jar</span>
          </div>
          <p className="text-slate-500 dark:text-slate-600 text-sm">
            © {new Date().getFullYear()} Spin the Jar. Built for fun.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-500 dark:text-slate-500">
            <Link href="/learn" className="hover:text-slate-900 dark:hover:text-white transition-colors font-bold text-slate-700 dark:text-slate-300">Learning Center</Link>
            <Link href="/learn/date-night-ideas-for-couples" className="hover:text-slate-900 dark:hover:text-white transition-colors">Date Night Ideas</Link>
            <Link href="/learn/cant-decide-where-to-eat" className="hover:text-slate-900 dark:hover:text-white transition-colors">Where to Eat</Link>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="/use-cases" className="hover:text-slate-900 dark:hover:text-white transition-colors">Ways to Use</Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@datejar.app" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main >
  );
}
