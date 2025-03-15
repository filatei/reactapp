import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import dbConnect from '@/lib/mongoose';
import { User, IUser } from '@/models/User';
import { Payment, IPayment } from '@/models/Payment';
import { ServiceCharge, IServiceCharge } from '@/models/ServiceCharge';
import { toPlainObject } from '@/lib/utils/mongoose';
import { Types } from 'mongoose';

interface OutstandingPayment {
    _id: Types.ObjectId;
    totalAmount: number;
    user: IUser;
}

export const metadata: Metadata = {
    title: 'Admin Dashboard | ReactiveApp',
    description: 'Manage users, service charges, and payments',
};

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    const currentUser = await User.findOne({ email: session.user.email }).lean();

    if (!currentUser || !currentUser.role || currentUser.role !== 'admin') {
        redirect('/');
    }

    // Fetch all users
    const users = await User.find({ _id: { $ne: currentUser._id } })
        .select('-password')
        .lean()
        .then(docs => toPlainObject(docs) as unknown as IUser[]);

    // Fetch all payments
    const payments = await Payment.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean()
        .then(docs => toPlainObject(docs) as unknown as IPayment[]);

    // Fetch all service charges
    const serviceCharges = await ServiceCharge.find()
        .populate('createdBy', 'name email')
        .populate('affectedUsers', 'name email')
        .populate('paidBy', 'name email')
        .sort({ createdAt: -1 })
        .lean()
        .then(docs => toPlainObject(docs) as unknown as IServiceCharge[]);

    // Calculate payment statistics
    const paymentStats = {
        total: payments.reduce((sum: number, p: IPayment) => sum + p.amount, 0),
        pending: payments.filter((p: IPayment) => p.status === 'pending').length,
        completed: payments.filter((p: IPayment) => p.status === 'completed').length,
        failed: payments.filter((p: IPayment) => p.status === 'failed').length,
    };

    // Get users with outstanding payments
    const usersWithOutstandingPayments = await Payment.aggregate<OutstandingPayment>([
        {
            $match: { status: 'pending' }
        },
        {
            $group: {
                _id: '$userId',
                totalAmount: { $sum: '$amount' }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        }
    ]).then(docs => toPlainObject(docs));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <AdminDashboard
                users={users}
                payments={payments}
                serviceCharges={serviceCharges}
                paymentStats={paymentStats}
                usersWithOutstandingPayments={usersWithOutstandingPayments}
            />
        </div>
    );
} 