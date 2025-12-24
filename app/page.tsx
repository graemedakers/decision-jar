"use client";

import { Jar3D } from "@/components/Jar3D";
import { Button } from "@/components/ui/Button";
import { Heart, Sparkles, Calendar, Utensils, Wine, Shuffle, Users, ArrowRight, Star, CheckCircle2, User, Brain } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PRICING } from "@/lib/config";

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
    name: 'Decision Jar',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'A fun, interactive way for couples and friends to decide on their next date or hangout.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      ratingCount: ratingCount,
    },
    featureList: 'Decision Maker, Couple Sync, Weekend Planner, Dining Concierge',
    screenshot: 'https://date-jar.vercel.app/og-image.jpg',
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does the date idea generator work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Simply add your own ideas or use our pre-filled categories. When you're ready, filter by budget, time, or energy level, and 'Spin the Jar' to get a random suggestion that fits your mood perfectly."
          }
        },
        {
          '@type': 'Question',
          name: 'Is Decision Jar free for couples?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! You can create a jar, add unlimited ideas, and sync with your partner or group for free. We also offer a premium tier for advanced features like the Smart Weekend Planner and Dining Concierge.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I find restaurants for date night?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. Our Dining Concierge feature helps you find top-rated romantic restaurants near you, complete with reviews, ratings, and price levels.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does it sync between two phones?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Decision Jar is designed for couples and groups. Once you invite your partner or friends using your unique code, your jars are instantly linked. Any idea added or removed on one phone appears on the others immediately.'
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
            <div className="p-1.5 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">Decision Jar</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => router.push('/dashboard')} size="sm" className="bg-slate-200/50 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border-none text-slate-800 dark:text-white">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
                <Button onClick={() => router.push('/signup')} size="sm" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 border-none hidden sm:flex">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ... Hero ... */}
      <section className="relative pt-32 pb-20 md:pt-32 md:pb-32 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }} // Increased delay slightly
            className="space-y-8 text-center md:text-left w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-accent">
              <Sparkles className="w-3 h-3" />
              <span>Stop the indecision</span>
            </div>
            <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-white dark:to-slate-400 tracking-tight leading-[1.1] break-words">
              The Ultimate <br />
              <span className="text-primary dark:text-accent">Decision Maker</span> <br />
              For Everyone.
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto md:mx-0 leading-relaxed break-words">
              Stop scrolling and start doing. Our <strong>shared app for friends and families</strong> helps you curate, manage, and discover <strong>fun things to do</strong>.
              Let fate decide your next adventure or use our <strong>smart planner</strong> for the perfect weekend.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Button
                onClick={() => router.push(user ? '/dashboard' : '/signup')}
                className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 w-full sm:w-auto"
              >
                {user ? "Go to Dashboard" : "Create Your Jar"} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

            </div>
            <div className="pt-4 flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-600 dark:text-white">
                    <User className="w-4 h-4" />
                  </div>
                ))}
              </div>
              <p>Loved by {reviews.length > 50 ? reviews.length + "+" : "500+"} couples & friend groups</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative h-[400px] md:h-[600px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-[100px] animate-pulse-glow" />
            <div className="scale-90 md:scale-150 relative z-10">
              <Jar3D />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ... Features ... */}
      <section id="features" className="py-24 px-6 relative z-10 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-white">Everything You Need for <br /><span className="text-primary dark:text-accent">Better Decisions</span></h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We've packed Decision Jar with features designed to take the stress out of planning and put the fun back into spending time together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Shuffle}
              title="Spin the Jar"
              description="Overcome decision paralysis with our random idea generator. Filter by cost, duration, or vibe and let fate decide your next date or hangout."
              delay={0.1}
            />
            <FeatureCard
              icon={Users}
              title="Sync with Anyone"
              description="Perfect for friends and families. Invite your whole group to share a jar and sync ideas instantly."
              delay={0.2}
            />
            <FeatureCard
              icon={Calendar}
              title="Weekend Planner"
              description="Build a complete itinerary for two or ten. Our smart planner finds real, live events happening nearby to create a custom weekend plan."
              delay={0.3}
            />

            <FeatureCard
              icon={Utensils}
              title="Dining Concierge"
              description="Find top-rated restaurants nearby. Get curated recommendations perfect for a romantic dinner or a lively group meal."
              delay={0.4}
            />
            <FeatureCard
              icon={Wine}
              title="Bar Finder"
              description="Discover hidden speakeasies and rooftop bars. The best nightlife spots for a drink or a night out with the crew."
              delay={0.5}
            />
            <FeatureCard
              icon={Star}
              title="Rate & Remember"
              description="Keep a digital scrapbook of your memories. Rate your experiences, upload photos, and cherish every moment."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {reviews.length > 0 && (
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">Users Love Decision Jar</h2>
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
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{review.user?.name || "Decision Jar User"}</span>
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
              description="Sign up and create a digital jar. Add your favorite date ideas or use our generator to find some."
            />
            <StepCard
              number="2"
              title="Invite Friends"
              description="Send a unique invite code to your partner or friends so you can all contribute and spin the jar together."
            />
            <StepCard
              number="3"
              title="Spin & Go"
              description="When date night comes, spin the jar to pick an activity. No more indecision!"
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
                <p className="text-slate-600 dark:text-slate-400">Perfect for a single couple or small group</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-800 dark:text-white">Free</span>
                <span className="text-slate-500 dark:text-slate-400">/forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "1 Active Jar Included",
                  "Up to 4 Members/Jar",
                  "25 Date Ideas Capacity",
                  "Basic 'Spin' Feature",
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
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Decision Jar Pro</h3>
                <p className="text-slate-600 dark:text-slate-400">For the ultimate social life</p>
              </div>
              <div className="mb-8 space-y-2">
                <div>
                  <span className="text-4xl font-bold text-slate-800 dark:text-white">{PRICING.MONTHLY}</span>
                  <span className="text-slate-500 dark:text-slate-400">/month</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  or <strong className="text-slate-900 dark:text-white">{PRICING.LIFETIME}</strong> Lifetime
                </div>
                <div className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/10 rounded-full inline-block mt-2">
                  ✨ Includes {PRICING.TRIAL_DAYS}-Day Free Full-Access Trial
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Unlimited Jars & Members",
                  "Unlimited Date Ideas",
                  "Smart Weekend Planner (AI)",
                  "Dining Concierge & Bar Scout",
                  "Custom Itinerary Builder",
                  "Support Future Development"
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to know about your new favorite social app.</p>
          </div>

          <div className="glass-card p-6 md:p-8 space-y-2">
            <FaqItem
              question="How does the decision maker work?"
              answer="Simply add your own ideas or use our pre-filled categories. When you're ready, filter by budget, time, or energy level, and 'Spin the Jar' to get a random suggestion that fits your mood perfectly."
            />
            <FaqItem
              question="Is Decision Jar free?"
              answer="Yes! You can create unlimited jars (e.g., one for your partner, one for roommates, one for work lunch!), add unlimited ideas, and sync with everyone for free. We also offer a premium tier for advanced features."
            />
            <FaqItem
              question="Can I find restaurants and bars?"
              answer="Absolutely. Our Concierge features help you find top-rated restaurants and bars near you, complete with reviews, ratings, and price levels."
            />
            <FaqItem
              question="Does it sync between multiple phones?"
              answer="Yes. Once you invite your partner or friends using your unique code, your jars are instantly linked. Any idea added or removed on one phone appears on everyone's device immediately."
            />
          </div>
        </div>
      </section>

      {/* ... CTA ... */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-3xl blur-2xl opacity-20" />
          <div className="glass-card p-12 rounded-3xl text-center relative overflow-hidden border-slate-200 dark:border-white/10">
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">Ready to spice things up?</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Join thousands of people who are making better decisions, more often. It's free to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => router.push('/signup')}
                  className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-200 border-none w-full sm:w-auto"
                >
                  Create Your Jar Now
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" /> Free 14-day trial of premium features</span>
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" /> Then just AU$2.50 / month per person</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="font-bold text-slate-600 dark:text-slate-400">Decision Jar</span>
          </div>
          <p className="text-slate-500 dark:text-slate-600 text-sm">
            © {new Date().getFullYear()} Decision Jar. Built for fun.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@datejar.app" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main >
  );
}
