import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { toObjectId, toPlainObject } from '@/lib/utils/mongoose';
import { sendUpdate } from '@/app/api/events/route';

export async function PUT(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Check if the current user is an admin
        await dbConnect();
        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const userId = context.params.id;
        if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const body = await request.json();
        const { role } = body;

        if (!role || !['user', 'admin'].includes(role.toLowerCase())) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            toObjectId(userId),
            { role: role.toLowerCase() },
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Send real-time update
        await sendUpdate({
            type: 'USER_UPDATED',
            userId: user._id.toString(),
            updates: { role: user.role }
        });

        return NextResponse.json(toPlainObject(user));
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update user role' },
            { status: 500 }
        );
    }
} 