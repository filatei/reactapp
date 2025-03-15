import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserList } from '@/components/admin/UserList';
import dbConnect from '@/lib/mongoose';
import { User, IUser } from '@/models/User';
import { Types } from 'mongoose';

export const metadata: Metadata = {
    title: 'Manage Users | Admin Dashboard',
    description: 'Manage users and their roles',
};

export default async function UsersPage() {
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

    // Get all users and convert to plain objects
    const users = await User.find()
        .select('-password') // Exclude password field
        .sort({ createdAt: -1 })
        .lean();

    // Convert Mongoose documents to plain objects with proper typing
    const typedUsers = users.map(user => ({
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
    })) as IUser[];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Users</h1>
            </div>

            <UserList users={typedUsers} />
        </div>
    );
} 