import { useState, useEffect, useCallback } from 'react';
import { User } from '@prisma/client';

export type ActivityType = 'viewing' | 'typing' | 'voting' | 'adding_idea' | 'vetoing' | 'spinning';

export interface PresenceActivity {
    type: ActivityType;
    details?: string;
}

export interface PresenceState {
    userId: string;
    name: string;
    avatar?: string;
    image?: string; // API uses 'image'
    status: 'online' | 'idle';
    activity?: PresenceActivity;
    lastSeen: number;
}

export function useJarPresence(jarId: string, currentUser: User | null) {
    const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);

    // Heartbeat function
    const sendHeartbeat = useCallback(async (activity?: PresenceActivity) => {
        if (!jarId || !currentUser) return;

        try {
            await fetch(`/api/jar/${jarId}/presence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'online',
                    activity: activity || { type: 'viewing' }
                })
            });
        } catch (err) {
            console.error('Failed to send presence heartbeat', err);
        }
    }, [jarId, currentUser]);

    // Polling function
    const fetchPresence = useCallback(async () => {
        if (!jarId) return;

        try {
            const res = await fetch(`/api/jar/${jarId}/presence`);
            if (res.ok) {
                const data = await res.json();
                let users = data.users || [];

                // Fallback: If Redis is missing or server returns empty,
                // and we have a current user, add them to the list so UI isn't empty.
                if (currentUser && !users.some((u: PresenceState) => u.userId === currentUser.id)) {
                    users.push({
                        userId: currentUser.id,
                        name: currentUser.name || 'You',
                        image: currentUser.image || undefined,
                        status: 'online',
                        lastSeen: Date.now(),
                        activity: { type: 'viewing' }
                    });
                }

                setOnlineUsers(users);
            }
        } catch (err) {
            console.error('Failed to fetch presence', err);
        }
    }, [jarId, currentUser]);

    // Set up polling interval (every 5 seconds)
    useEffect(() => {
        fetchPresence(); // Initial fetch
        const interval = setInterval(fetchPresence, 5000);
        return () => clearInterval(interval);
    }, [fetchPresence]);

    // Set up heartbeat interval (every 10 seconds)
    useEffect(() => {
        sendHeartbeat(); // Initial heartbeat
        const interval = setInterval(() => sendHeartbeat(), 10000);
        return () => clearInterval(interval);
    }, [sendHeartbeat]);

    // Export a function to manually update activity (e.g. typing)
    const updateActivity = (type: ActivityType, details?: string) => {
        sendHeartbeat({ type, details });
        // Optimistic update? Maybe not needed for simple presence
    };

    return {
        onlineUsers,
        updateActivity,
        refresh: fetchPresence
    };
}
