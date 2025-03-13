import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User, IUser } from '@/models/User';
import dbConnect from '@/lib/mongoose';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check if the current user is an admin
        const currentUser = await User.findOne({ email: session.user.email }).lean() as IUser | null;
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can update user roles' }, { status: 403 });
        }

        const body = await request.json();
        const { role } = body;

        if (!role || !['user', 'admin'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            params.id,
            { role },
            { new: true }
        ).lean() as IUser | null;

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
} 