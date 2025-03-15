import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
import { User } from '@/models/User';
import { initializeFlutterwavePayment, initializeMonnifyPayment } from '@/lib/payment';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { serviceChargeId, paymentMethod, provider, amount, description } = await request.json();

        if (!serviceChargeId || !paymentMethod || !provider || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Get the current user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get the service charge
        const serviceCharge = await ServiceCharge.findById(serviceChargeId);
        if (!serviceCharge) {
            return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });
        }

        // Check if user has already paid
        if (serviceCharge.paidBy.includes(user._id)) {
            return NextResponse.json(
                { error: 'You have already paid this service charge' },
                { status: 400 }
            );
        }

        // Generate a unique reference
        const reference = nanoid();

        // Create a new payment record
        serviceCharge.payments.push({
            reference,
            provider,
            status: 'pending',
            amount,
            paidBy: user._id,
            metadata: {
                paymentMethod,
                description,
            },
        });

        await serviceCharge.save();

        // Common payment details
        const paymentDetails = {
            amount,
            email: user.email,
            name: user.name || 'User',
            phoneNumber: user.phoneNumber,
            reference,
            description: description || 'Service Charge Payment',
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/verify?ref=${reference}&provider=${provider}`,
        };

        let paymentResponse;

        // Initialize payment based on provider
        if (provider === 'flutterwave') {
            paymentResponse = await initializeFlutterwavePayment(paymentDetails);
            return NextResponse.json({
                redirectUrl: paymentResponse.data.link,
                reference,
            });
        } else if (provider === 'monnify') {
            paymentResponse = await initializeMonnifyPayment(paymentDetails);
            return NextResponse.json({
                redirectUrl: paymentResponse.responseBody.checkoutUrl,
                reference,
            });
        }

        return NextResponse.json(
            { error: 'Invalid payment provider' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error initializing payment:', error);
        return NextResponse.json(
            { error: 'Failed to initialize payment' },
            { status: 500 }
        );
    }
} 