import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { Types } from 'mongoose';

export async function PUT(
    request: Request,
    { params }: { params: { id: string; userId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { isAdmin } = body;

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

        // Update user's role
        if (isAdmin) {
            // Move user from members to admins
            estate.members = estate.members.filter(
                (memberId: Types.ObjectId) => memberId.toString() !== params.userId
            );
            if (!estate.admins.includes(new Types.ObjectId(params.userId))) {
                estate.admins.push(new Types.ObjectId(params.userId));
            }
        } else {
            // Move user from admins to members
            estate.admins = estate.admins.filter(
                (adminId: Types.ObjectId) => adminId.toString() !== params.userId
            );
            if (!estate.members.includes(new Types.ObjectId(params.userId))) {
                estate.members.push(new Types.ObjectId(params.userId));
            }
        }

        await estate.save();

        return NextResponse.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }
} 