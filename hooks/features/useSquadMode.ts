
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from "@/lib/logger";

export function useSquadMode(
    jarId?: string,
    onExternalSpinStart?: () => void,
    onExternalSpinResult?: (idea: any) => void,
    onContentUpdate?: () => void
) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!jarId || !supabase) return;

        const channel = supabase.channel(`jar:${jarId}`)
            .on('broadcast', { event: 'spin-start' }, () => {
                logger.info('Squad: Received spin-start');
                onExternalSpinStart?.();
            })
            .on('broadcast', { event: 'spin-result' }, (payload) => {
                logger.info('Squad: Received spin-result', payload);
                onExternalSpinResult?.(payload.payload.idea);
            })
            .on('broadcast', { event: 'content-update' }, () => {
                logger.info('Squad: Received content-update');
                onContentUpdate?.();
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsConnected(true);
            });

        // Listen for local broadcast requests from other components (like mutation hooks)
        const handleBroadcastRequest = async (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.jarId === jarId && customEvent.detail?.event) {
                logger.info(`Squad: Broadcasting ${customEvent.detail.event} via window trigger`);
                await channel.send({
                    type: 'broadcast',
                    event: customEvent.detail.event,
                    payload: customEvent.detail.payload || {}
                });
            }
        };

        window.addEventListener('decision-jar:broadcast', handleBroadcastRequest);

        return () => {
            window.removeEventListener('decision-jar:broadcast', handleBroadcastRequest);
            if (supabase) supabase.removeChannel(channel);
            setIsConnected(false);
        };
    }, [jarId]); // Removed callbacks from dependency array to prevent reconnection loops. Assuming stable refs or OK to be stale closure if updated.

    const broadcastSpinStart = async () => {
        if (!jarId || !supabase) return;
        await supabase.channel(`jar:${jarId}`).send({
            type: 'broadcast',
            event: 'spin-start',
            payload: {}
        });
    };

    const broadcastSpinResult = async (idea: any) => {
        if (!jarId || !supabase) return;
        await supabase.channel(`jar:${jarId}`).send({
            type: 'broadcast',
            event: 'spin-result',
            payload: { idea }
        });
    };

    return { isConnected, broadcastSpinStart, broadcastSpinResult };
}
