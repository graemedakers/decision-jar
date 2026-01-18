import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from "@/lib/logger";

export function useSquadMode(
    jarId?: string,
    onExternalSpinStart?: () => void,
    onExternalSpinResult?: (idea: any) => void,
    onContentUpdate?: () => void
) {
    const [isConnected, setIsConnected] = useState(false);

    // Use refs to hold latest callbacks, preventing stale closures without re-subscribing
    const onSpinStartRef = useRef(onExternalSpinStart);
    const onSpinResultRef = useRef(onExternalSpinResult);
    const onContentUpdateRef = useRef(onContentUpdate);

    useEffect(() => {
        onSpinStartRef.current = onExternalSpinStart;
        onSpinResultRef.current = onExternalSpinResult;
        onContentUpdateRef.current = onContentUpdate;
    }, [onExternalSpinStart, onExternalSpinResult, onContentUpdate]);

    useEffect(() => {
        if (!jarId || !supabase) return;

        const channel = supabase.channel(`jar:${jarId}`)
            .on('broadcast', { event: 'spin-start' }, () => {
                logger.info('Squad: Received spin-start');
                if (onSpinStartRef.current) onSpinStartRef.current();
            })
            .on('broadcast', { event: 'spin-result' }, (payload) => {
                logger.info('Squad: Received spin-result', payload);
                if (onSpinResultRef.current) onSpinResultRef.current(payload.payload.idea);
            })
            .on('broadcast', { event: 'content-update' }, () => {
                logger.info('Squad: Received content-update');
                if (onContentUpdateRef.current) onContentUpdateRef.current();
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsConnected(true);
            });

        // Listen for local broadcast requests from other components
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
    }, [jarId]);

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
