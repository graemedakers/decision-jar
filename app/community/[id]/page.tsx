"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/Button";
import { Users, Lock, ArrowLeft, CheckCircle, Clock, AlertTriangle, Shield, Sparkles, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CommunityAdminModal } from "@/components/CommunityAdminModal";

interface CommunityDetail {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    memberCount: number;
    memberLimit?: number;
    isFull: boolean;
    membershipStatus?: 'ACTIVE' | 'PENDING' | 'WAITLISTED' | 'NONE'; // We'll need to fetch this
    isAdmin?: boolean;
}

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [jar, setJar] = useState<CommunityDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [isForking, setIsForking] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // We reuse the single jar API or create a specific public detail one.
                // For now, let's assume we can fetch basic public info + auth status
                // We might need a new endpoint `GET /api/jars/[id]/public`
                // But let's try using the join status to check (hacky) or just a dedicated route.

                // Let's assume we fetch from our list API with a filter or logic, 
                // but actually we need a specific endpoint to get "My Status".
                // Let's create `GET /api/jars/[id]/public-details` later?
                // For now, let's mock the fetch or use a simple one.

                // Actually, let's use the one we have logic for in other places or fetch list and find.
                // Fetching the list is inefficient.
                // Let's use `GET /api/jars/community?id={id}` pattern if we update that route, 
                // but better to have /api/jars/[id]/public-info

                const res = await fetch(`/api/jars/${id}/public-details`);
                if (res.ok) {
                    setJar(await res.json());
                } else {
                    // Fallback or error
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            const res = await fetch(`/api/jars/${id}/join`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setJar(prev => prev ? { ...prev, membershipStatus: data.status } : null);
            } else if (res.status === 401) {
                // Redirect to login
                router.push(`/login?callbackUrl=${window.location.pathname}`);
            } else {
                alert("Failed to join.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsJoining(false);
        }
    };

    const handleFork = async () => {
        setIsForking(true);
        try {
            const res = await fetch(`/api/jars/${id}/fork`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                alert("✨ Successfully cloned! Taking you to your new jar...");
                router.push('/dashboard');
            } else if (res.status === 401) {
                router.push(`/login?callbackUrl=${window.location.pathname}`);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to clone jar.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred during cloning.");
        } finally {
            setIsForking(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
    if (!jar) return <div className="min-h-screen flex items-center justify-center">Community not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header Image */}
            <div className="h-64 md:h-80 w-full relative bg-slate-200 dark:bg-slate-800">
                {jar.imageUrl ? (
                    <img src={jar.imageUrl} alt={jar.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                        <Users className="w-20 h-20 text-white/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                <div className="absolute top-6 left-6">
                    <Link href="/community" className="inline-flex items-center text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Index
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 shadow-sm">{jar.name}</h1>
                        <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                                <Users className="w-4 h-4" />
                                {jar.memberCount} / {jar.memberLimit || '∞'} members
                            </span>
                            {jar.isFull && (
                                <span className="flex items-center gap-1 bg-amber-500/90 text-white px-3 py-1 rounded-full backdrop-blur-md shadow-lg">
                                    <Clock className="w-4 h-4" /> Waitlist Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About this Community</h2>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                            {jar.description}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl sticky top-8">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Join {jar.name}</h3>

                        {jar.membershipStatus === 'ACTIVE' ? (
                            <div className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 p-4 rounded-xl flex items-center gap-3 mb-4">
                                <CheckCircle className="w-6 h-6" />
                                <span className="font-bold">You are a member!</span>
                            </div>
                        ) : jar.membershipStatus === 'PENDING' ? (
                            <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl flex items-center gap-3 mb-4">
                                <Clock className="w-6 h-6" />
                                <span className="font-bold">Request Pending</span>
                            </div>
                        ) : jar.membershipStatus === 'WAITLISTED' ? (
                            <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 p-4 rounded-xl flex items-center gap-3 mb-4">
                                <Clock className="w-6 h-6" />
                                <div>
                                    <span className="font-bold block">On Waitlist</span>
                                    <span className="text-xs opacity-80">We'll notify you when a spot opens.</span>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={handleJoin}
                                disabled={isJoining}
                                className={`w-full h-12 text-lg font-bold shadow-lg ${jar.isFull ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'}`}
                            >
                                {isJoining ? "Processing..." : jar.isFull ? "Join Waitlist" : "Request to Join"}
                            </Button>
                        )}

                        <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                            <p className="flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Admin approval required
                            </p>
                            <p className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" />
                                {jar.isFull ? "Waitlist policy: One-out, one-in." : "Limited spots available."}
                            </p>
                        </div>

                        {jar.membershipStatus === 'ACTIVE' && (
                            <div className="space-y-3 mt-4">
                                <Button variant="outline" className="w-full" onClick={async () => {
                                    try {
                                        await fetch('/api/auth/switch-jar', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ jarId: jar.id }),
                                        });
                                    } catch (e) {
                                        console.error(e);
                                    }
                                    router.push('/dashboard');
                                }}>
                                    Go to Jar Dashboard
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={async () => {
                                        if (!confirm("Are you sure you want to leave this community?")) return;
                                        try {
                                            const res = await fetch(`/api/jars/${id}/leave`, { method: 'POST' });
                                            if (res.ok) {
                                                setJar(prev => prev ? { ...prev, membershipStatus: 'NONE' } : null);
                                                router.refresh();
                                            } else {
                                                const data = await res.json();
                                                alert(data.error || "Failed to leave.");
                                            }
                                        } catch (e) { console.error(e); }
                                    }}
                                >
                                    Leave Community
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Personal Curation / Fork Section */}
                    <div className="mt-8 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                        {/* Background Sparkles Decal */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <Sparkles className="w-24 h-24 text-white" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                                Personal Curation
                                <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/20">Pro</span>
                            </h3>
                            <p className="text-white/80 text-sm mb-6 leading-relaxed">
                                Love these ideas? Clone this entire jar to your personal collection with one click.
                            </p>
                            <Button
                                onClick={handleFork}
                                disabled={isForking}
                                className="w-full h-14 bg-white text-violet-700 hover:bg-slate-50 font-black text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {isForking ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-700" />
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        Clone to My Jars
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-[10px] text-white/50 mt-4 font-medium uppercase tracking-tighter">
                                Instant value • No Request Required
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Admin Modal */}
            {jar && (
                <CommunityAdminModal
                    isOpen={isAdminModalOpen}
                    onClose={() => setIsAdminModalOpen(false)}
                    jarId={jar.id}
                    jarName={jar.name}
                />
            )}

            {/* Admin Floating Button */}
            {jar?.isAdmin && (
                <div className="fixed bottom-6 right-6 z-40">
                    <Button
                        onClick={() => setIsAdminModalOpen(true)}
                        className="h-14 px-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Shield className="w-5 h-5" /> Admin Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
}
