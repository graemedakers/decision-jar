
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSquadMode(jarId?: string, onExternalSpinStart?: () => void, onExternalSpinResult?: (idea: any) => void) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!jarId || !supabase) return;

        const channel = supabase.channel(`jar:${jarId}`)
            .on('broadcast', { event: 'spin-start' }, () => {
                console.log('Squad: Received spin-start');
                onExternalSpinStart?.();
            })
            .on('broadcast', { event: 'spin-result' }, (payload) => {
                console.log('Squad: Received spin-result', payload);
                onExternalSpinResult?.(payload.payload.idea);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsConnected(true);
            });

        return () => {
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
