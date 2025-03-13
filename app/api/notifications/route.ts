import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User, IUser } from '@/models/User';
import dbConnect from '@/lib/mongoose';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check if the current user is an admin
        const currentUser = await User.findOne({ email: session.user.email }).lean() as IUser | null;
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can send notifications' }, { status: 403 });
        }

        const body = await request.json();
        const { title, message, type, selectedUsers } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
        }

        // Get target users based on type
        let targetUsers: IUser[] = [];
        if (type === 'all') {
            targetUsers = await User.find({ _id: { $ne: currentUser._id } }).lean() as IUser[];
        } else if (type === 'selected' && selectedUsers?.length > 0) {
            targetUsers = await User.find({ _id: { $in: selectedUsers } }).lean() as IUser[];
        } else {
            return NextResponse.json({ error: 'Invalid notification type or no users selected' }, { status: 400 });
        }

        // Here you would integrate with your notification service (email, push notifications, etc.)
        // For now, we'll just log the notifications
        console.log('Sending notifications:', {
            title,
            message,
            recipients: targetUsers.map(u => u.email),
        });

        return NextResponse.json({
            message: 'Notifications sent successfully',
            recipients: targetUsers.length,
        });
    } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json(
            { error: 'Failed to send notifications' },
            { status: 500 }
        );
    }
} 