import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { Types } from 'mongoose';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string; userId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get current user to check admin role
        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get estate
        const estate = await Estate.findById(params.id);
        if (!estate) {
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        // Remove user from estate
        estate.admins = estate.admins.filter(
            (adminId: Types.ObjectId) => adminId.toString() !== params.userId
        );
        estate.members = estate.members.filter(
            (memberId: Types.ObjectId) => memberId.toString() !== params.userId
        );

        await estate.save();

        // Update user's estate field
        await User.findByIdAndUpdate(params.userId, { $unset: { estate: 1 } });

        return NextResponse.json({ message: 'User removed successfully' });
    } catch (error) {
        console.error('Error removing user:', error);
        return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
    }
} 