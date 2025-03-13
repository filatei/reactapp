import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServiceCharge } from '@/models/ServiceCharge';
import dbConnect from '@/lib/mongoose';
import { User, IUser } from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).lean() as IUser | null;
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If user is admin, return all charges, otherwise only return charges affecting this user
        const query = user.role === 'admin'
            ? {}
            : { affectedUsers: user._id };

        const serviceCharges = await ServiceCharge.find(query)
            .populate('createdBy', 'name email')
            .populate('affectedUsers', 'name email')
            .populate('paidBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(serviceCharges);
    } catch (error) {
        console.error('Error fetching service charges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch service charges' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).lean() as IUser | null;
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can create service charges' }, { status: 403 });
        }

        const body = await request.json();
        const serviceCharge = await ServiceCharge.create({
            ...body,
            createdBy: user._id,
            status: 'active'
        });

        const populatedCharge = await ServiceCharge.findById(serviceCharge._id)
            .populate('createdBy', 'name email')
            .populate('affectedUsers', 'name email')
            .populate('paidBy', 'name email');

        return NextResponse.json(populatedCharge, { status: 201 });
    } catch (error) {
        console.error('Error creating service charge:', error);
        return NextResponse.json(
            { error: 'Failed to create service charge' },
            { status: 500 }
        );
    }
} 