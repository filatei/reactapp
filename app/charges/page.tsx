import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
import { User } from '@/models/User';
import { ServiceChargesOverview } from '@/components/dashboard/ServiceChargesOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Service Charges | Dashboard',
    description: 'View and manage your service charges',
};

export default async function ServiceChargesPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    
    // Get current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
        redirect('/auth/signin');
    }

    // Fetch service charges that either directly target the user or include them in affectedUsers
    const serviceCharges = await ServiceCharge.find({
        $or: [
            { userId: user._id },
            { affectedUsers: user._id }
        ]
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .populate('affectedUsers', 'name email')
    .populate('paidBy', 'name email')
    .lean();

    const outstandingCharges = serviceCharges.filter(charge => 
        ['active', 'unpaid'].includes(charge.status)
    );
    const paidCharges = serviceCharges.filter(charge => charge.status === 'paid');

    const totalOutstanding = outstandingCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const totalPaid = paidCharges.reduce((sum, charge) => sum + charge.amount, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Service Charges</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Outstanding Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-foreground">
                            {new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                            }).format(totalOutstanding)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {outstandingCharges.length} outstanding charge(s)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-foreground">
                            {new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                            }).format(totalPaid)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {paidCharges.length} paid charge(s)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <ServiceChargesOverview serviceCharges={JSON.parse(JSON.stringify(serviceCharges))} />
        </div>
    );
} 