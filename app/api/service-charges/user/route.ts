import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fetch service charges for the current user
        const serviceCharges = await ServiceCharge.find({
            userId: session.user.id
        })
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('userId', 'name email'); // Populate user details

        return NextResponse.json(serviceCharges);
    } catch (error) {
        console.error('Error fetching user service charges:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch service charges' },
            { status: 500 }
        );
    }
} 