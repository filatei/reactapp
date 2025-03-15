import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
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

        const { paymentMethod } = await request.json();

        if (!paymentMethod) {
            return NextResponse.json(
                { error: 'Payment method is required' },
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
        const serviceCharge = await ServiceCharge.findById(params.id);
        if (!serviceCharge) {
            return NextResponse.json({ error: 'Service charge not found' }, { status: 404 });
        }

        // Check if the service charge is active
        if (serviceCharge.status !== 'active') {
            return NextResponse.json(
                { error: 'Service charge is not active' },
                { status: 400 }
            );
        }

        // Check if the user has already paid
        if (serviceCharge.paidBy.includes(user._id)) {
            return NextResponse.json(
                { error: 'You have already paid this service charge' },
                { status: 400 }
            );
        }

        // Process payment based on method
        switch (paymentMethod) {
            case 'card':
                // Here you would integrate with a payment processor like Stripe
                // For now, we'll just simulate a successful payment
                break;
            case 'bank':
                // Here you would integrate with a bank transfer service
                // For now, we'll just simulate a successful payment
                break;
            case 'crypto':
                // Here you would integrate with a cryptocurrency payment processor
                // For now, we'll just simulate a successful payment
                break;
            case 'mobile':
                // Here you would integrate with mobile money services like M-Pesa
                // For now, we'll just simulate a successful payment
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid payment method' },
                    { status: 400 }
                );
        }

        // Update the service charge status and add user to paidBy array
        serviceCharge.paidBy.push(user._id);

        // If all affected users have paid, mark the charge as paid
        if (serviceCharge.affectedUsers.every((userId: Types.ObjectId) =>
            serviceCharge.paidBy.some((paidUserId: Types.ObjectId) =>
                paidUserId.toString() === userId.toString()
            )
        )) {
            serviceCharge.status = 'paid';
        }

        await serviceCharge.save();

        // Populate the updated service charge
        const updatedCharge = await ServiceCharge.findById(serviceCharge._id)
            .populate('createdBy', 'name email')
            .populate('affectedUsers', 'name email')
            .populate('paidBy', 'name email')
            .lean();

        return NextResponse.json(updatedCharge);
    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
} 