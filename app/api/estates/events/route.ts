import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { Types } from 'mongoose';

export async function GET() {
    const headersList = headers();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            // Send initial data
            await dbConnect();
            const estates = await Estate.find()
                .select('name address description admins members joinRequests')
                .populate('admins', 'name email')
                .populate('members', 'name email')
                .sort({ name: 1 })
                .lean()
                .then(estates => estates.map(estate => ({
                    ...estate,
                    _id: estate._id.toString(),
                    admins: (estate.admins || []).map(admin => ({
                        _id: admin._id.toString(),
                        name: admin.name,
                        email: admin.email
                    })),
                    members: (estate.members || []).map(member => ({
                        _id: member._id.toString(),
                        name: member.name,
                        email: member.email
                    })),
                    joinRequests: (estate.joinRequests || []).map(request => ({
                        _id: request._id.toString(),
                        user: request.user.toString(),
                        status: request.status
                    }))
                })));

            sendEvent({ type: 'initial', data: estates });

            // Keep the connection alive
            const interval = setInterval(() => {
                sendEvent({ type: 'ping' });
            }, 30000);

            // Cleanup on close
            return () => {
                clearInterval(interval);
                controller.close();
            };
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
} 