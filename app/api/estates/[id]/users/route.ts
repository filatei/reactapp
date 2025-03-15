import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Check if current user is admin
        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { email, role = 'member' } = body;

        // Find the estate
        const estate = await Estate.findById(params.id);
        if (!estate) {
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        // Find the user to add
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user is already in the estate
        const isAdmin = estate.admins.includes(userToAdd._id);
        const isMember = estate.members.includes(userToAdd._id);

        if (isAdmin || isMember) {
            return NextResponse.json({ error: 'User is already in the estate' }, { status: 400 });
        }

        // Add user to appropriate array based on role
        if (role === 'admin') {
            estate.admins.push(userToAdd._id);
        } else {
            estate.members.push(userToAdd._id);
        }

        await estate.save();

        // Return updated estate with populated fields
        const updatedEstate = await Estate.findById(estate._id)
            .populate('admins', 'name email')
            .populate('members', 'name email')
            .lean();

        return NextResponse.json(updatedEstate);
    } catch (error) {
        console.error('Error adding user to estate:', error);
        return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
    }
} 