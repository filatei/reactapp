import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NotificationForm } from '@/components/admin/NotificationForm';
import dbConnect from '@/lib/mongoose';
import { IUser, User } from '@/models/User';
import { Types } from 'mongoose';

export const metadata: Metadata = {
    title: 'Send Notifications | Admin Dashboard',
    description: 'Send notifications to users',
};

export default async function NotificationsPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    
    // Get current user to check admin role
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/dashboard');
    }

    // Get all users for the notification form
    const users = await User.find()
        .select('name email')
        .sort({ name: 1 })
        .lean()
        .then(users => users.map(user => ({
            ...user,
            _id: (user._id as Types.ObjectId).toString(),
            role: 'user' as const,
            address: null,
            phoneNumber: null,
            createdAt: user.createdAt?.toISOString(),
            updatedAt: user.updatedAt?.toISOString(),
        }))) as unknown as IUser[];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Send Notifications</h1>
            </div>

            <div className="max-w-2xl">
                <NotificationForm users={users} />
            </div>
        </div>
    );
} 