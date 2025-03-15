import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
import { Types } from 'mongoose';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await dbConnect();

        const serviceCharge = await ServiceCharge.findById(params.id);
        if (!serviceCharge) {
            return NextResponse.json(
                { error: 'Service charge not found' },
                { status: 404 }
            );
        }

        await serviceCharge.markAsPaid(new Types.ObjectId(session.user.id));

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error marking service charge as paid:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to mark service charge as paid' },
            { status: 500 }
        );
    }
} 