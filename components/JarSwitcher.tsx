"use client";

import { useState } from "react";
import { ChevronDown, Plus, Users, User, Heart, Check, LogOut, Loader2, MoreVertical, Trash2, Utensils, Film, PartyPopper, CheckSquare, Sparkles, Layers, Book } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CreateJarModal } from "./CreateJarModal";
import { JoinJarModal } from "./JoinJarModal";
import { JarManagerModal } from "./JarManagerModal";
import { Settings } from "lucide-react";
import { showError } from "@/lib/toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface Jar {
    id: string;
    name: string | null;
    type: "ROMANTIC" | "SOCIAL" | "GENERIC";
    topic?: string | null;
}

const getJarIcon = (jar: Jar, className?: string) => {
    switch (jar.topic) {
        case "Food": return <Utensils className={className} />;
        case "Movies": return <Film className={className} />;
        case "Activities": return <PartyPopper className={className} />;
        case "Chores": return <CheckSquare className={className} />;
        case "Books": return <Book className={className} />;
        // Fallback or Generic
        default:
            if (jar.type === 'ROMANTIC') return <Heart className={className} />;
            if (jar.type === 'GENERIC') return <User className={className} />;
            return <Users className={className} />;
    }
};

const getJarColorClasses = (type: Jar['type']) => {
    switch (type) {
        case 'ROMANTIC': return "bg-pink-500/10 border-pink-500/20 text-pink-500";
        case 'GENERIC': return "bg-violet-500/10 border-violet-500/20 text-violet-500";
        default: return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    }
};

interface Membership {
    jarId: string;
    role: "ADMIN" | "MEMBER";
    jar: Jar;
}

interface User {
    id: string;
    activeJarId: string | null;
    memberships: Membership[];
    isPremium?: boolean;
}

interface JarSwitcherProps {
    user: User;
    className?: string;
    variant?: 'default' | 'title';
    onSwitch?: () => Promise<void> | void;
}

export function JarSwitcher({ user, className, variant = 'default', onSwitch }: JarSwitcherProps) {
    // ... state ...
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const activeMembership = user.memberships.find(m => m.jarId === user.activeJarId) || user.memberships[0];
    const activeJar = activeMembership?.jar;
    const otherMemberships = user.memberships.filter(m => m.jarId !== activeJar?.id);

    // Calc hasRomanticJar
    const hasRomanticJar = user.memberships.some(m => m.jar.type === 'ROMANTIC');

    const handleSwitchJar = async (jarId: string) => {
        if (jarId === activeJar?.id) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/switch-jar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jarId }),
            });

            if (res.ok) {
                if (onSwitch) {
                    await onSwitch();
                    router.refresh(); // Update generic server components
                } else {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error("Failed to switch jar", error);
        } finally {
            setIsLoading(false);
        }
    };

    // ... rest of handlers ...
    const handleLeaveJar = async (jarId: string) => {
        // First check if user is the last member
        let isLastMember = false;
        try {
            const checkRes = await fetch(`/api/jar/${jarId}/check-membership`);
            if (checkRes.ok) {
                const data = await checkRes.json();
                isLastMember = data.memberCount <= 1;
            }
        } catch (e) {
            console.error("Failed to check membership", e);
        }

        const message = isLastMember
            ? "WARNING: You are the last member of this Jar. If you leave, the Jar and all its ideas/history will be PERMANENTLY DELETED. Are you sure?"
            : "Are you sure you want to leave this Jar? You will lose access to its ideas.";

        if (!confirm(message)) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/jar/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jarId }),
            });

            if (res.ok) {
                router.refresh();
                window.location.reload();
            } else {
                const data = await res.json();
                showError(data.error || "Failed to leave jar");
            }
        } catch (error) {
            console.error("Failed to leave jar", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateJar = () => {
        setIsCreateModalOpen(true);
    };

    const handleJoinJar = () => {
        setIsJoinModalOpen(true);
    };

    return (
        <div className={cn("relative", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {variant === 'title' ? (
                        <button className="flex items-center gap-1 group outline-none text-left min-w-0 max-w-full">
                            <h1 className="text-lg md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1 min-w-0">
                                {activeJar ? (
                                    <>
                                        <span className="truncate min-w-0">
                                            {activeJar.name || "My Jar"}
                                        </span>
                                        <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white transition-colors flex-shrink-0" />
                                    </>
                                ) : (
                                    <>
                                        <span className="text-slate-500 dark:text-slate-400 font-normal">(No Jar Selected)</span>
                                        <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-white transition-colors flex-shrink-0" />
                                    </>
                                )}
                            </h1>
                        </button>
                    ) : (
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors border border-slate-200 dark:border-white/5 outline-none"
                        >
                            {activeJar ? (
                                <>
                                    {getJarIcon(activeJar, "w-3.5 h-3.5 text-slate-500 dark:text-slate-400")}
                                    <span className="text-sm font-medium text-slate-700 dark:text-white max-w-[150px] md:max-w-[120px] truncate">
                                        {activeJar.name || "My Jar"}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Create Jar</span>
                                </>
                            )}
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                        <DropdownMenuLabel className="text-slate-500 text-[10px] uppercase tracking-wider px-2 py-1">Switch Jar</DropdownMenuLabel>
                        {user.memberships.length > 5 && (
                            <div className="px-2 pb-1">
                                <input
                                    type="text"
                                    placeholder="Search jars..."
                                    className="w-full text-xs bg-slate-100 dark:bg-white/5 border-none rounded-md px-2 py-1.5 focus:ring-1 focus:ring-purple-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}
                    </div>

                    {/* Scrollable Jar List */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {/* Current Active Jar (Highlighted at top of list if no search or matches search) */}
                        {activeJar && (!searchQuery || activeJar.name?.toLowerCase().includes(searchQuery.toLowerCase())) && (
                            <div className="p-1">
                                <DropdownMenuItem className="bg-slate-50 dark:bg-white/5 data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-white/10 cursor-default flex justify-between group rounded-md">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center border",
                                            getJarColorClasses(activeJar.type as any)
                                        )}>
                                            {getJarIcon(activeJar, "w-4 h-4")}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[140px]">{activeJar.name || "My Jar"}</div>
                                            <div className="text-xs text-slate-500">Active • {activeJar.topic || (activeJar.type === 'ROMANTIC' ? 'Personal' : 'Group')}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLeaveJar(activeJar.id);
                                        }}
                                        className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Leave Jar"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                    </button>
                                </DropdownMenuItem>
                            </div>
                        )}

                        {/* Other Jars */}
                        <div className="p-1 space-y-0.5">
                            {otherMemberships
                                .filter(m => !searchQuery || m.jar.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((membership) => (
                                    <DropdownMenuItem
                                        key={membership.jarId}
                                        onClick={() => handleSwitchJar(membership.jarId)}
                                        disabled={isLoading}
                                        className="flex items-center justify-between cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5 rounded-md"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center border",
                                                getJarColorClasses(membership.jar.type as any)
                                            )}>
                                                {getJarIcon(membership.jar, "w-4 h-4")}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                                                    {membership.jar.name || "Untitled Jar"}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {membership.role === 'ADMIN' ? 'Admin' : 'Member'}
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                        </div>
                    </div>

                    {/* Fixed Footer Actions */}
                    <div className="p-1 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
                        <DropdownMenuItem onClick={() => setIsManagerOpen(true)} className="gap-3 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5 rounded-md py-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <Settings className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Manage My Jars</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={handleCreateJar} className="gap-3 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5 rounded-md py-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <Plus className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Create New Jar</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={handleJoinJar} className="gap-3 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5 rounded-md py-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <LogOut className="w-3.5 h-3.5 text-slate-400 rotate-180" />
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Join Existing Jar</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => router.push('/community')} className="gap-3 cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5 rounded-md py-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Discover Communities</span>
                        </DropdownMenuItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateJarModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                hasRomanticJar={hasRomanticJar}
                isPro={!!user.isPremium}
                currentJarCount={user.memberships.length}
            />

            <JoinJarModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />

            <JarManagerModal
                isOpen={isManagerOpen}
                onClose={() => setIsManagerOpen(false)}
            />
        </div>
    );
}
