import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile/ProfileForm';
import PaymentHistory from '@/components/payments/PaymentHistory';
import PaymentForm from '@/components/payments/PaymentForm';
import dbConnect from '@/lib/mongoose';
import { User, IUser } from '@/models/User';

export const metadata: Metadata = {
    title: 'Profile | ReactiveApp',
    description: 'Manage your profile and payments',
};

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).lean() as IUser | null;

    if (!user) {
        redirect('/auth/signin');
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
                    <ProfileForm 
                        initialData={{
                            name: user.name,
                            email: user.email,
                            phoneNumber: user.phoneNumber,
                            address: user.address,
                        }}
                    />
                </div>
                
                <div>
                    <h2 className="text-2xl font-bold mb-6">Payment History</h2>
                    <PaymentHistory />
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">Outstanding Charges</h2>
                <div className="bg-white shadow rounded-lg p-6">
                    <PaymentForm
                        amount={99.99}
                        serviceType="Premium Subscription"
                        description="Monthly premium subscription fee"
                    />
                </div>
            </div>
        </div>
    );
} 