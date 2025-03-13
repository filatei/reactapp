import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ServiceChargeList } from '@/components/admin/ServiceChargeList';
import { ServiceChargeForm } from '@/components/admin/ServiceChargeForm';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
import { IUser } from '@/models/User';

interface ServiceChargeWithUsers {
    _id: string;
    title: string;
    description: string;
    amount: number;
    type: 'annual' | 'incidental';
    category: 'maintenance' | 'repairs' | 'utilities' | 'security' | 'other';
    status: 'active' | 'paid' | 'cancelled';
    dueDate?: string;
    createdBy: IUser;
    affectedUsers: IUser[];
    paidBy: IUser[];
}

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
        .lean()) as unknown as ServiceChargeWithUsers[];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Service Charges</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Add New Service Charge</h2>
                    <ServiceChargeForm />
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold mb-4">Service Charges List</h2>
                    <ServiceChargeList serviceCharges={serviceCharges} />
                </div>
            </div>
        </div>
    );
} 