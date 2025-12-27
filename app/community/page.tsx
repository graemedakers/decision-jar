"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Search, Users, Plus, Loader2, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface CommunityJar {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    memberCount: number;
    memberLimit?: number;
    isFull: boolean;
}

export default function CommunityIndexPage() {
    const [jars, setJars] = useState<CommunityJar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchJars();
    }, []);

    const fetchJars = async (query?: string) => {
        setIsLoading(true);
        try {
            const url = query ? `/api/jars/community?q=${encodeURIComponent(query)}` : '/api/jars/community';
            const res = await fetch(url);
            if (res.ok) {
                setJars(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJars(search);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Hero Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                            Discover Communities
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            Join public jars to share ideas and decisions with people who share your interests.
                            From foodies to hikers, find your squad.
                        </p>

                        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search communities..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>
                            <Button type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900">Search</Button>
                        </form>
                    </div>

                    <div className="shrink-0">
                        <div className="p-6 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-3xl border border-violet-500/20 max-w-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Start your own Community</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Create a public jar, manage members, and build a space for shared experiences.
                            </p>
                            <Link href="/community/create">
                                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                                    <Plus className="w-4 h-4 mr-2" /> Create Community Jar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : jars.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No communities found matching your search.</p>
                        <Button variant="ghost" className="mt-4" onClick={() => { setSearch(""); fetchJars(); }}>
                            Clear Search
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jars.map((jar) => (
                            <motion.div
                                key={jar.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-violet-500/5 transition-all cursor-pointer flex flex-col"
                                onClick={() => router.push(`/community/${jar.id}`)}
                            >
                                <div className="aspect-video bg-slate-100 dark:bg-white/5 relative overflow-hidden">
                                    {jar.imageUrl ? (
                                        <img src={jar.imageUrl} alt={jar.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {jar.isFull && (
                                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-sm">
                                                Waitlist Only
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-500 transition-colors">{jar.name}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
                                        {jar.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mt-auto">
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                                            <Users className="w-4 h-4" />
                                            <span>
                                                {jar.memberCount} / {jar.memberLimit ? jar.memberLimit : '∞'} members
                                            </span>
                                        </div>
                                        <div className="flex items-center text-violet-600 dark:text-violet-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                            View <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
