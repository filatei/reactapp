import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageTransition } from '@/components/ui/page-transition';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { AvailableEstatesList } from '@/components/estates/AvailableEstatesList';
import { Types } from 'mongoose';

interface PopulatedAdmin {
    _id: Types.ObjectId;
    name: string;
    email: string;
}

interface PopulatedMember {
    _id: Types.ObjectId;
    name: string;
    email: string;
}

export const metadata: Metadata = {
    title: 'Join an Estate',
    description: 'Browse and join available estates',
};

export default async function EstatesPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    
    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
        redirect('/auth/signin');
    }

    // If user already belongs to an estate, redirect to dashboard
    if (currentUser.estate) {
        redirect('/dashboard');
    }

    // Get all estates with populated fields
    const estates = await Estate.find()
        .select('name address description admins members joinRequests')
        .populate<{ admins: PopulatedAdmin[] }>('admins', 'name email')
        .populate<{ members: PopulatedMember[] }>('members', 'name email')
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

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-4 md:py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-bold">Available Estates</h1>
                </div>

                <div className="bg-card rounded-lg shadow-sm p-4 md:p-6">
                    <Suspense fallback={<LoadingSpinner />}>
                        <AvailableEstatesList estates={estates} />
                    </Suspense>
                </div>
            </div>
        </PageTransition>
    );
} 