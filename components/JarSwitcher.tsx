"use client";

import { useState } from "react";
import { ChevronDown, Plus, Users, User, Heart, Check, LogOut, Loader2, MoreVertical, Trash2, Utensils, Film, PartyPopper, CheckSquare, Sparkles, Layers, Book } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CacheKeys } from "@/lib/cache-utils";
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
    level?: number;
    xp?: number;
    referenceCode?: string;
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

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'OWNER': return 'Owner';
        case 'ADMIN': return 'Admin';
        case 'VIEWER': return 'Viewer';
        default: return 'Member';
    }
};

export function JarSwitcher({ user, className, variant = 'default', onSwitch }: JarSwitcherProps) {
    // ... state ...
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const queryClient = useQueryClient();

    const activeMembership = user.memberships.find(m => m.jarId === user.activeJarId) || user.memberships[0];
    const activeJar = activeMembership?.jar;
    const otherMemberships = user.memberships.filter(m => m.jarId !== activeJar?.id);

    // Calc hasRomanticJar
    const hasRomanticJar = user.memberships.some(m => m.jar.type === 'ROMANTIC');

    const handleSwitchJar = async (jarId: string) => {
        // Find the target jar
        const targetMembership = user.memberships.find(m => m.jarId === jarId);
        const targetJar = targetMembership?.jar;

        if (jarId === activeJar?.id) return;

        setIsLoading(true);

        // ✅ OPTIMISTIC UPDATE: Only possible if we know the jar details
        if (targetJar) {
            queryClient.setQueryData(CacheKeys.user(), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    activeJarId: jarId,
                    jarName: targetJar.name,
                    // Also update jar-specific gamification data
                    level: targetJar.level || 1,
                    xp: targetJar.xp || 0
                };
            });
        }

        // ✅ CRITICAL: Invalidate ideas cache to fetch ideas for new jar
        queryClient.invalidateQueries({ queryKey: CacheKeys.ideas() });

        try {
            const res = await fetch('/api/auth/switch-jar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jarId }),
            });

            if (res.ok) {
                // Refetch to sync with server (background)
                if (onSwitch) {
                    await onSwitch();
                    router.refresh(); // Update server components
                } else {
                    // Fallback: still do optimistic update, then hard refresh
                    setTimeout(() => window.location.reload(), 100);
                }
            } else {
                // ❌ API failed: Rollback optimistic update
                queryClient.invalidateQueries({ queryKey: CacheKeys.user() });
                queryClient.invalidateQueries({ queryKey: CacheKeys.ideas() });
                showError("Failed to switch jar");
            }
        } catch (error) {
            // ❌ Network error: Rollback optimistic update
            console.error("Failed to switch jar", error);
            queryClient.invalidateQueries({ queryKey: CacheKeys.user() });
            queryClient.invalidateQueries({ queryKey: CacheKeys.ideas() });
            showError("Failed to switch jar");
        } finally {
            setIsLoading(false);
        }
    };

    // ... rest of handlers ...
    const handleLeaveJar = async (jarId: string) => {
        // First check if user is the last member
        let isLastMember = false;
        try {
            const checkRes = await fetch(`/api/jars/${jarId}/members`);
            if (checkRes.ok) {
                const data = await checkRes.json();
                isLastMember = data.length <= 1;
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
            const res = await fetch(`/api/jars/${jarId}/leave`, {
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
                        <button
                            className="flex items-center gap-1 group outline-none text-left min-w-0 max-w-full"
                            aria-label="Switch Jar"
                            data-tour="jar-selector"
                        >
                            <h1 className="text-lg md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1 min-w-0">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin flex-shrink-0 text-purple-500" />
                                        <span className="opacity-60 transition-opacity">Switching...</span>
                                    </>
                                ) : activeJar ? (
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
                            aria-label="Switch Jar"
                            data-tour="jar-selector"
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
                                    aria-label="Search jars"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}
                    </div>

                    {/* Scrollable Jar List */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar py-1">
                        {/* Current Active Jar */}
                        {activeJar && (!searchQuery || activeJar.name?.toLowerCase().includes(searchQuery.toLowerCase())) && (
                            <div className="px-2 mb-1">
                                <DropdownMenuItem className="p-2 bg-indigo-50/50 dark:bg-indigo-500/10 focus:bg-indigo-100 dark:focus:bg-indigo-500/20 cursor-default flex justify-between group rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border shadow-sm shrink-0",
                                            getJarColorClasses(activeJar.type as any)
                                        )}>
                                            {getJarIcon(activeJar, "w-5 h-5")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 w-full">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {activeJar.name || "My Jar"}
                                                </span>
                                                {activeJar.referenceCode && (
                                                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-white/10 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5 shadow-xs shrink-0">
                                                        #{activeJar.referenceCode}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="flex w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <span className="text-xs text-slate-500 font-medium truncate">
                                                    {getRoleLabel(activeMembership?.role || 'MEMBER')} • {activeJar.topic || (activeJar.type === 'ROMANTIC' ? 'Personal' : 'Group')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions for Active Jar */}
                                    <div className="flex flex-col gap-1 ml-2 pl-2 border-l border-indigo-200/50 dark:border-white/10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const el = document.getElementById('smart-prompt-input');
                                                if (el) {
                                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    const input = el.querySelector('input');
                                                    if (input) input.focus();
                                                }
                                            }}
                                            className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-md text-indigo-400 hover:text-indigo-600 transition-colors"
                                            title="Smart Fill"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </DropdownMenuItem>
                            </div>
                        )}

                        {/* Recent/Other Jars */}
                        <div className="px-2 space-y-0.5">
                            {otherMemberships
                                .filter(m => !searchQuery || m.jar.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((membership) => (
                                    <DropdownMenuItem
                                        key={membership.jarId}
                                        onClick={() => handleSwitchJar(membership.jarId)}
                                        disabled={isLoading}
                                        className="p-2 flex items-center justify-between cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5 rounded-xl group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={cn(
                                                "w-9 h-9 rounded-full flex items-center justify-center border shrink-0 opacity-80 group-hover:opacity-100 transition-opacity",
                                                getJarColorClasses(membership.jar.type as any)
                                            )}>
                                                {getJarIcon(membership.jar, "w-4 h-4")}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                                                        {membership.jar.name || "Untitled Jar"}
                                                    </span>
                                                    {membership.jar.referenceCode && (
                                                        <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                                                            #{membership.jar.referenceCode}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">
                                                    {getRoleLabel(membership.role)} • {membership.jar.topic || 'General'}
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                        </div>
                    </div>

                    {/* Fixed Footer Actions */}
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm space-y-1">
                        <DropdownMenuItem onClick={() => setIsManagerOpen(true)} className="group gap-3 cursor-pointer focus:bg-white dark:focus:bg-white/5 rounded-lg py-2 px-3 border border-transparent focus:border-slate-200 dark:focus:border-white/10 transition-all">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-200/50 dark:bg-slate-800 text-slate-500 group-focus:text-slate-700 dark:group-focus:text-slate-300 transition-colors">
                                <Settings className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Manage My Jars</span>
                        </DropdownMenuItem>

                        <div className="grid grid-cols-2 gap-1">
                            <DropdownMenuItem onClick={handleCreateJar} className="group gap-2 cursor-pointer focus:bg-white dark:focus:bg-white/5 rounded-lg py-2 px-3 border border-transparent focus:border-slate-200 dark:focus:border-white/10">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-indigo-100/50 dark:bg-indigo-500/20 text-indigo-500">
                                    <Plus className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Create</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={handleJoinJar} className="group gap-2 cursor-pointer focus:bg-white dark:focus:bg-white/5 rounded-lg py-2 px-3 border border-transparent focus:border-slate-200 dark:focus:border-white/10">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-orange-100/50 dark:bg-orange-500/20 text-orange-500">
                                    <LogOut className="w-3 h-3 rotate-180" />
                                </div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Join</span>
                            </DropdownMenuItem>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateJarModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                hasRomanticJar={hasRomanticJar}
                isPro={!!user.isPremium}
                currentJarCount={user.memberships.length}
                onSuccess={(newJarId) => handleSwitchJar(newJarId)}
            />

            <JoinJarModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />

            <JarManagerModal
                isOpen={isManagerOpen}
                onClose={() => setIsManagerOpen(false)}
                onRefresh={onSwitch}
            />
        </div>
    );
}
