import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { UserDetailsForm } from '@/components/admin/UserDetailsForm';
import { Types } from 'mongoose';

interface UserDetailsPageProps {
    params: {
        id: string;
    };
}

interface UserDocument {
    _id: Types.ObjectId;
    name?: string;
    email: string;
    role?: 'user' | 'admin';
    provider?: string;
    providerId?: string;
    address?: string | {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    phoneNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const metadata: Metadata = {
    title: 'User Details | Admin Dashboard',
    description: 'Manage user details and roles',
};

export default async function UserDetailsPage({
    params,
}: UserDetailsPageProps) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    
    // Get current admin user
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== 'admin') {
        redirect('/dashboard');
    }

    // Validate the ID format
    if (!Types.ObjectId.isValid(params.id)) {
        redirect('/admin/users');
    }

    // Get target user
    const user = await User.findById(params.id).lean() as UserDocument;
    
    if (!user) {
        redirect('/admin/users');
    }

    // Format the address if it exists
    const formattedAddress = user.address
        ? typeof user.address === 'string'
            ? user.address
            : `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}, ${user.address.country}`
        : '';

    // Serialize the user object
    const serializedUser = {
        _id: user._id.toString(),
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        provider: user.provider || '',
        providerId: user.providerId || '',
        address: formattedAddress,
        phoneNumber: user.phoneNumber || '',
        createdAt: user.createdAt ? user.createdAt.toISOString() : null,
        updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">User Details</h1>
            <UserDetailsForm user={serializedUser} />
        </div>
    );
} 