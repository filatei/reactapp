import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';
import { Payment } from '@/models/Payment';
import dbConnect from '@/lib/mongoose';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { amount, serviceType, description } = body;

        await dbConnect();

        // Create a pending payment record
        const payment = await Payment.create({
            userId: session.user.email,
            amount,
            currency: 'usd',
            status: 'pending',
            paymentMethod: 'stripe',
            serviceType,
            description,
        });

        // Create Stripe checkout session
        const stripeSession = await createCheckoutSession({
            amount,
            serviceType,
            description,
            paymentId: payment._id.toString(),
        });

        // Update payment with Stripe session ID
        await Payment.findByIdAndUpdate(payment._id, {
            stripeSessionId: stripeSession.id,
        });

        return NextResponse.json({ sessionId: stripeSession.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
} 