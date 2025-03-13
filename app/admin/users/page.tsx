import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserList } from '@/components/admin/UserList';
import dbConnect from '@/lib/mongoose';
import { User, IUser } from '@/models/User';

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
    const users = (await User.find().sort({ createdAt: -1 }).lean()) as unknown as IUser[];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Users</h1>
            </div>

            <UserList users={users} />
        </div>
    );
} 