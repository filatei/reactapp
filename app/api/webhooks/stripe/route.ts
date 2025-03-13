import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { Payment } from '@/models/Payment';
import dbConnect from '@/lib/mongoose';
import Stripe from 'stripe';

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe-signature header' },
                { status: 400 }
            );
        }

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        await dbConnect();

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await Payment.findOneAndUpdate(
                    { stripeSessionId: session.id },
                    { status: 'completed', paymentDate: new Date() }
                );
                break;
            }
            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                await Payment.findOneAndUpdate(
                    { stripeSessionId: session.id },
                    { status: 'failed' }
                );
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                await Payment.findOneAndUpdate(
                    { stripeSessionId: charge.payment_intent as string },
                    { status: 'refunded' }
                );
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
} 