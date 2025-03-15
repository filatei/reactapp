import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UpdateEvent {
    type: 'USER_UPDATED' | 'SERVICE_CHARGE_UPDATED' | 'PAYMENT_UPDATED';
    userId?: string;
    serviceChargeId?: string;
    paymentId?: string;
    updates: Record<string, unknown>;
}

type UpdateCallback = (data: UpdateEvent) => void;

export function useRealtimeUpdates(onUpdate: UpdateCallback) {
    const { data: session } = useSession();

    const connect = useCallback(() => {
        if (!session?.user?.email) return;

        const eventSource = new EventSource('/api/events', {
            withCredentials: true,
        });

        eventSource.onmessage = (event) => {
            if (event.data === 'ping') return;
            if (event.data === 'connected') {
                console.log('Connected to event stream');
                return;
            }

            try {
                const data = JSON.parse(event.data) as UpdateEvent;
                onUpdate(data);
            } catch (error) {
                console.error('Error parsing event data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            eventSource.close();
            // Attempt to reconnect after 5 seconds
            setTimeout(connect, 5000);
        };

        return () => {
            eventSource.close();
        };
    }, [session?.user?.email, onUpdate]);

    useEffect(() => {
        const cleanup = connect();
        return () => {
            cleanup?.();
        };
    }, [connect]);
} 