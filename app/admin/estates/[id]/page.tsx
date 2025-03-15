import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { EstateUserList } from '@/components/admin/EstateUserList';
import { EstateJoinRequests } from '@/components/admin/EstateJoinRequests';
import { PageTransition } from '@/components/ui/page-transition';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { Types } from 'mongoose';


export const metadata: Metadata = {
    title: 'Manage Estate | Admin Dashboard',
    description: 'Manage estate users and join requests',
};

export default async function EstateManagementPage({ params }: { params: { id: string } }) {
    // Validate and sanitize the ID parameter

    const { id } = await params
    if (!id) {
        notFound();
    }

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

    // Get estate details with proper typing for populated fields
    const estate = await Estate.findById(id)
        .populate<{ admins: { _id: Types.ObjectId; name: string; email: string }[] }>("admins", "name email")
        .populate<{ members: { _id: Types.ObjectId; name: string; email: string }[] }>("members", "name email")
        .populate<{ joinRequests: { _id: Types.ObjectId; user: { _id: Types.ObjectId; name: string; email: string }; status: 'pending' | 'approved' | 'rejected'; createdAt: Date }[] }>("joinRequests.user", "name email")
        .lean();

    if (!estate) {
        notFound();
    }

    // Convert MongoDB document to plain object and ensure proper serialization
    const plainEstate = {
        ...estate,
        _id: estate._id.toString(),
        admins: estate.admins?.map(admin => ({
            _id: admin._id.toString(),
            name: admin.name,
            email: admin.email
        })) || [],
        members: estate.members?.map(member => ({
            _id: member._id.toString(),
            name: member.name,
            email: member.email
        })) || [],
        joinRequests: (estate.joinRequests || []).map(req => ({
            _id: req._id.toString(),
            user: {
                _id: req.user._id.toString(),
                name: req.user.name,
                email: req.user.email
            },
            status: req.status,
            createdAt: new Date(req.createdAt).toISOString()
        })),
        createdAt: new Date(estate.createdAt).toISOString(),
        updatedAt: new Date(estate.updatedAt).toISOString()
    };

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Manage Estate: {plainEstate.name}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Estate Users</h2>
                        <Suspense fallback={<LoadingSpinner />}>
                            <EstateUserList estate={plainEstate} />
                        </Suspense>
                    </div>
                    
                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Join Requests</h2>
                        <Suspense fallback={<LoadingSpinner />}>
                            <EstateJoinRequests estate={plainEstate} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
} 