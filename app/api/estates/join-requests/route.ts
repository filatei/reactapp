import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { toPlainObject } from '@/lib/utils/mongoose';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get user to check role
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only admins and estate admins can view join requests
        if (user.role !== 'admin' && user.role !== 'estate_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Find all users with pending join requests
        const usersWithRequests = await User.find({
            'estateJoinRequests.status': 'pending'
        })
            .populate('estateJoinRequests.estate', 'name address')
            .select('name email estateJoinRequests');

        return NextResponse.json(toPlainObject(usersWithRequests));
    } catch (error) {
        console.error('Error fetching join requests:', error);
        return NextResponse.json({ error: 'Failed to fetch join requests' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { estateId } = body;

        // Check if estate exists
        const estate = await Estate.findById(estateId);
        if (!estate) {
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        // Check if user is already a member
        if (estate.members.includes(user._id)) {
            return NextResponse.json({ error: 'Already a member of this estate' }, { status: 400 });
        }

        // Check if user already has a pending request
        const existingRequest = user.estateJoinRequests.find(
            request => request.estate.toString() === estateId && request.status === 'pending'
        );
        if (existingRequest) {
            return NextResponse.json({ error: 'Join request already pending' }, { status: 400 });
        }

        // Add join request
        user.estateJoinRequests.push({
            estate: estate._id,
            status: 'pending',
            requestedAt: new Date(),
            updatedAt: new Date()
        });

        await user.save();

        return NextResponse.json({ message: 'Join request submitted successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error submitting join request:', error);
        return NextResponse.json({ error: 'Failed to submit join request' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get admin user
        const admin = await User.findOne({ email: session.user.email });
        if (!admin || (admin.role !== 'admin' && admin.role !== 'estate_admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, estateId, status } = body;

        // Get user with join request
        const user = await User.findOne({
            _id: userId,
            'estateJoinRequests.estate': estateId,
            'estateJoinRequests.status': 'pending'
        });

        if (!user) {
            return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
        }

        // Get estate
        const estate = await Estate.findById(estateId);
        if (!estate) {
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        // Check if admin has permission to manage this estate
        if (admin.role === 'estate_admin' && !estate.estateAdmins.includes(admin._id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update join request status
        const joinRequest = user.estateJoinRequests.find(
            request => request.estate.toString() === estateId
        );
        if (joinRequest) {
            joinRequest.status = status;
            joinRequest.updatedAt = new Date();
        }

        // If approved, add user to estate members
        if (status === 'approved') {
            if (!estate.members.includes(user._id)) {
                estate.members.push(user._id);
            }
            user.estate = estate._id;
        }

        await Promise.all([user.save(), estate.save()]);

        return NextResponse.json({ message: 'Join request updated successfully' });
    } catch (error) {
        console.error('Error updating join request:', error);
        return NextResponse.json({ error: 'Failed to update join request' }, { status: 500 });
    }
} 