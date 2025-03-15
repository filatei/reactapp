import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EstateList } from '@/components/admin/EstateList';
import { EstateForm } from '@/components/admin/EstateForm';
import { PageTransition } from '@/components/ui/page-transition';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { Types } from 'mongoose';
import { User } from '@/models/User';

export const metadata: Metadata = {
    title: 'Manage Estates | Admin Dashboard',
    description: 'Manage estates and their members',
};

export default async function EstatesPage() {
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

    // Get all estates with populated fields
    const estates = await Estate.find()
        .populate('admins', 'name email')
        .populate('members', 'name email')
        .populate('joinRequests.user', 'name email')
        .sort({ name: 1 })
        .lean()
        .then(estates => estates.map(estate => ({
            ...estate,
            _id: estate._id as Types.ObjectId,
            createdAt: new Date(estate.createdAt),
            updatedAt: new Date(estate.updatedAt)
        })));

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Manage Estates</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Add New Estate</h2>
                        <Suspense fallback={<LoadingSpinner />}>
                            <EstateForm />
                        </Suspense>
                    </div>
                    
                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Estates List</h2>
                        <Suspense fallback={<LoadingSpinner />}>
                            <EstateList estates={estates} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
} 