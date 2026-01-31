"use client";

import { useJarPresence, PresenceState } from "@/hooks/features/useJarPresence";
import { User, JarMember } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { User as UserIcon } from "lucide-react";

interface PresenceBarProps {
    jarId: string;
    currentUser: User | null;
}

export function PresenceBar({ jarId, currentUser }: PresenceBarProps) {
    const { onlineUsers } = useJarPresence(jarId, currentUser);

    const formatActivity = (user: PresenceState) => {
        if (!user.activity) return null;
        switch (user.activity.type) {
            case 'typing': return <span className="text-xs italic">is typing...</span>;
            case 'viewing': return <span className="text-xs">is looking around</span>;
            case 'voting': return <span className="text-xs text-blue-500 font-bold">is voting!</span>;
            case 'adding_idea': return <span className="text-xs text-green-500 font-bold">adding idea...</span>;
            case 'vetoing': return <span className="text-xs text-red-500 font-bold">used a VETO!</span>;
            default: return null;
        }
    };

    return (
        <div className="flex items-center gap-2 h-10">
            <div className="flex -space-x-2">
                {onlineUsers.map((user) => (
                    <div key={user.userId} className="relative group">
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 flex items-center justify-center overflow-hidden">
                            {(user.avatar || user.image) ? (
                                <img src={user.avatar || user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-4 h-4 text-slate-500" />
                            )}
                        </div>

                        {/* Status Indicator Dot */}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {user.name}
                        </div>
                    </div>
                ))}
            </div>

            {/* Transient Activity Toasts */}
            <div className="flex-1 flex gap-2 overflow-hidden">
                <AnimatePresence>
                    {onlineUsers.filter(u => u.activity).map(user => (
                        <motion.div
                            key={user.userId + (user.activity?.type || '')}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-full px-3 py-1 flex items-center gap-2"
                        >
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{user.name}</span>
                            {formatActivity(user)}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
