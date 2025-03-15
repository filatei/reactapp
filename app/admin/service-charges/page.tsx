import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ServiceChargeList } from '@/components/admin/ServiceChargeList';
import { ServiceChargeForm } from '@/components/admin/ServiceChargeForm';
import { PageTransition } from '@/components/ui/page-transition';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
import { ServiceChargeWithUsers } from '@/types/service-charge';
import { Types } from 'mongoose';

export const metadata: Metadata = {
    title: 'Manage Service Charges | Admin Dashboard',
    description: 'Manage service charges for all users',
};

export default async function ServiceChargesPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    const serviceCharges = (await ServiceCharge.find()
        .populate('createdBy', 'name email')
        .populate('affectedUsers', 'name email')
        .populate('paidBy', 'name email')
        .sort({ createdAt: -1 })
        .lean()
        .then(charges => charges.map(charge => ({
            ...charge,
            _id: charge._id as Types.ObjectId,
            dueDate: charge.dueDate ? new Date(charge.dueDate) : undefined,
            createdAt: new Date(charge.createdAt),
            updatedAt: new Date(charge.updatedAt)
        })))) as unknown as ServiceChargeWithUsers[];

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Service Charges</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Add New Service Charge</h2>
                        <Suspense fallback={<LoadingSpinner />}>
                            <ServiceChargeForm />
                        </Suspense>
                    </div>
                    
                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Service Charges List</h2>
                        <Suspense fallback={<LoadingSpinner />}>
                            <ServiceChargeList serviceCharges={serviceCharges} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
} 