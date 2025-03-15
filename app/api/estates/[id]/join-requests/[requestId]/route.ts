import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { Types } from 'mongoose';

export async function PUT(
    request: Request,
    { params }: { params: { id: string; requestId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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

        // Find the join request
        const request = estate.joinRequests.find(
            (req: any) => req._id.toString() === params.requestId
        );

        if (!request) {
            return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
        }

        if (action === 'approve') {
            // Add user to estate members
            estate.members.push(request.user);
            // Update user's estate field
            await User.findByIdAndUpdate(request.user, { estate: estate._id });
        }

        // Remove the join request
        estate.joinRequests = estate.joinRequests.filter(
            (req: any) => req._id.toString() !== params.requestId
        );

        await estate.save();

        return NextResponse.json({ message: `Request ${action}ed successfully` });
    } catch (error) {
        console.error('Error handling join request:', error);
        return NextResponse.json({ error: 'Failed to handle join request' }, { status: 500 });
    }
} 