import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { Estate } from '@/models/Estate';
import { User } from '@/models/User';
import { Types } from 'mongoose';

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

        // Get the current user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user already belongs to an estate
        if (user.estate) {
            return NextResponse.json({ error: 'User already belongs to an estate' }, { status: 400 });
        }

        // Find the estate

        const { id } = await params
        const estate = await Estate.findById(id);
        if (!estate) {
            console.log('estate not found')
            return NextResponse.json({ error: 'Estate not found' }, { status: 404 });
        }

        // Check if user already has a pending request
        const existingRequest = estate.joinRequests.find(
            request => {
                // console.log(request.user.toString(), user._id.toString(), request.status, 'request.user.toString() request.status')
                return request.user.toString() === user._id.toString() &&
                    request.status === 'pending'
            }
        );

        if (existingRequest) {
            console.log('You already have a pending join request')
            return NextResponse.json({ error: 'You already have a pending join request' }, { status: 400 });
        }

        // Add join request
        estate.joinRequests.push({
            _id: new Types.ObjectId(),
            user: user._id,
            status: 'pending',
            createdAt: new Date()
        });

        await estate.save();

        return NextResponse.json({ message: 'Join request sent successfully' });
    } catch (error) {
        console.error('Error sending join request:', error);
        return NextResponse.json(
            { error: 'Failed to send join request' },
            { status: 500 }
        );
    }
}