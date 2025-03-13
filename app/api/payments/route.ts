import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Payment } from '@/models/Payment';
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

        const payments = await Payment.find({ userId: user._id })
            .sort({ createdAt: -1 });

        return NextResponse.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
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

        const body = await request.json();
        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).lean() as IUser | null;
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const payment = await Payment.create({
            ...body,
            userId: user._id,
            status: 'pending'
        });

        // Here you would integrate with your payment processor (Stripe, PayPal, etc.)
        // For now, we'll just return the created payment
        return NextResponse.json(payment);
    } catch (error) {
        console.error('Error creating payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 