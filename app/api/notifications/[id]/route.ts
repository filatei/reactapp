import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Notification } from '@/models/Notification';
import { Types } from 'mongoose';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { isRead } = body;

        await dbConnect();

        // Find the notification and ensure it belongs to the user
        const notification = await Notification.findOne({
            _id: new Types.ObjectId(params.id),
            recipient: new Types.ObjectId(session.user.id)
        });

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        // Update the notification
        notification.isRead = isRead;
        await notification.save();

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
} 