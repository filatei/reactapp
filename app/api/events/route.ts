import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface UpdateEvent {
    type: 'USER_UPDATED' | 'SERVICE_CHARGE_UPDATED' | 'PAYMENT_UPDATED';
    userId?: string;
    serviceChargeId?: string;
    paymentId?: string;
    updates: Record<string, unknown>;
}

// Store connected clients
const clients = new Set<{
    email: string;
    controller: ReadableStreamDefaultController;
}>();

// Function to send updates to all connected clients
export async function sendUpdate(data: UpdateEvent): Promise<void> {
    clients.forEach(client => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        client.controller.enqueue(message);
    });
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const stream = new ReadableStream({
        start(controller) {
            const client = {
                email: session.user.email!,
                controller
            };
            clients.add(client);

            // Send initial connection message
            controller.enqueue('data: connected\n\n');

            // Send ping every 30 seconds to keep connection alive
            const pingInterval = setInterval(() => {
                controller.enqueue('data: ping\n\n');
            }, 30000);

            return () => {
                clearInterval(pingInterval);
                clients.delete(client);
            };
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
} 