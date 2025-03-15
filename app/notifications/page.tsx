import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageTransition } from '@/components/ui/page-transition';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dbConnect from '@/lib/mongoose';
import { Notification } from '@/models/Notification';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { Types } from 'mongoose';

interface PopulatedUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
}

interface PopulatedEstate {
    _id: Types.ObjectId;
    name: string;
}

interface PopulatedNotification {
    _id: Types.ObjectId;
    recipient: Types.ObjectId;
    sender: PopulatedUser;
    title: string;
    message: string;
    type: 'direct' | 'broadcast' | 'system';
    isRead: boolean;
    estate?: PopulatedEstate;
    createdAt: Date;
    updatedAt: Date;
}

export const metadata: Metadata = {
    title: 'Notifications | ReactiveApp',
    description: 'View your notifications and messages',
};

export default async function NotificationsPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();

    // Get user's notifications
    const notifications = await Notification.find({
        recipient: new Types.ObjectId(session.user.id)
    })
    .populate<{ sender: PopulatedUser }>('sender', 'name email')
    .populate<{ estate: PopulatedEstate }>('estate', 'name')
    .sort({ createdAt: -1 })
    .lean()
    .then((notifications: PopulatedNotification[]) => notifications.map(notification => {
        // Handle potentially missing sender
        const sender = notification.sender ? {
            _id: notification.sender._id.toString(),
            name: notification.sender.name,
            email: notification.sender.email
        } : {
            _id: 'system',
            name: 'System',
            email: 'system@reactiveapp.com'
        };

        return {
            ...notification,
            _id: notification._id.toString(),
            recipient: notification.recipient.toString(),
            sender,
            estate: notification.estate ? {
                _id: notification.estate._id.toString(),
                name: notification.estate.name
            } : undefined,
            createdAt: notification.createdAt.toISOString(),
            updatedAt: notification.updatedAt.toISOString()
        };
    }));

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                </div>

                <div className="bg-card rounded-lg shadow-sm p-6">
                    <Suspense fallback={<LoadingSpinner />}>
                        <NotificationsList notifications={notifications} />
                    </Suspense>
                </div>
            </div>
        </PageTransition>
    );
} 