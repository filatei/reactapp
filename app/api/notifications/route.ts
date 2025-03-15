import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { Notification } from '@/models/Notification';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Check if user is admin
        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, message, type, selectedUsers } = body;

        if (!title || !message || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let targetUsers: string[] = [];

        if (type === 'all') {
            // Get all user IDs except the admin
            const users = await User.find({ role: 'user' }).select('_id');
            targetUsers = users.map(user => user._id.toString());
        } else if (type === 'selected' && selectedUsers?.length > 0) {
            targetUsers = selectedUsers;
        } else {
            return NextResponse.json({ error: 'Invalid notification type or no users selected' }, { status: 400 });
        }

        // Create notification for each target user
        const notifications = await Promise.all(
            targetUsers.map(userId =>
                Notification.create({
                    title,
                    message,
                    recipient: userId,
                    createdBy: currentUser._id,
                })
            )
        );

        // Send emails to users
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GOOGLE_CLIENT_ID,
                pass: process.env.GOOGLE_CLIENT_SECRET,
            },
        });

        const users = await User.find({ _id: { $in: targetUsers } }).select('email name');

        await Promise.all(
            users.map(user =>
                transporter.sendMail({
                    from: process.env.GOOGLE_CLIENT_ID,
                    to: user.email,
                    subject: title,
                    html: `
                        <h1>${title}</h1>
                        <p>${message}</p>
                        <p>This is a notification from the admin team.</p>
                    `,
                })
            )
        );

        return NextResponse.json({
            message: 'Notifications sent successfully',
            count: notifications.length
        }, { status: 201 });

    } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
    }
} 