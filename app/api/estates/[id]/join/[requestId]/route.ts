import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';

export async function PUT(
    request: Request,
    { params }: { params: { id: string; requestId: string } }
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
        const { status } = body;

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Find the estate and the join request
        const estate = await Estate.findById(params.id);
        if (!estate) {
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        const joinRequest = estate.joinRequests.find(
            req => req._id.toString() === params.requestId
        );

        if (!joinRequest) {
            return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
        }

        if (joinRequest.status !== 'pending') {
            return NextResponse.json({ error: 'Join request has already been processed' }, { status: 400 });
        }

        // Update join request status
        joinRequest.status = status;

        // If approved, add user to members
        if (status === 'approved') {
            const userId = joinRequest.user;
            if (!estate.members.includes(userId)) {
                estate.members.push(userId);
            }
        }

        await estate.save();

        // Return updated estate with populated fields
        const updatedEstate = await Estate.findById(estate._id)
            .populate('admins', 'name email')
            .populate('members', 'name email')
            .populate('joinRequests.user', 'name email')
            .lean();

        return NextResponse.json(updatedEstate);
    } catch (error) {
        console.error('Error processing join request:', error);
        return NextResponse.json({ error: 'Failed to process join request' }, { status: 500 });
    }
} 