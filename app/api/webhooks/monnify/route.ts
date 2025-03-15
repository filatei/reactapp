import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
import { validateMonnifyWebhook } from '@/lib/payment';
import { sendEmail } from '@/lib/email';
import { Types } from 'mongoose';

export async function POST(request: Request) {
    try {
        const headersList = await headers();
        const signature = headersList.get('monnify-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'No verification signature found' },
                { status: 400 }
            );
        }

        const payload = await request.json();

        // Validate webhook signature
        const isValid = validateMonnifyWebhook(signature, payload);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find the service charge with the payment reference
        const serviceCharge = await ServiceCharge.findOne({
            'payments.reference': payload.eventData.transactionReference
        });

        if (!serviceCharge) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Find the specific payment
        const payment = serviceCharge.payments.find(
            (p: { reference: string }) => p.reference === payload.eventData.transactionReference
        );
        if (!payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Handle different event types
        switch (payload.eventType) {
            case 'SUCCESSFUL_TRANSACTION':
                payment.status = 'success';
                payment.paidAt = new Date();

                // Add user to paidBy array if not already present
                if (!serviceCharge.paidBy.includes(payment.paidBy)) {
                    serviceCharge.paidBy.push(payment.paidBy);
                }

                // Check if all affected users have paid
                const allPaid = serviceCharge.affectedUsers.every((userId: Types.ObjectId) =>
                    serviceCharge.paidBy.includes(userId)
                );

                if (allPaid) {
                    serviceCharge.status = 'paid';
                }

                await serviceCharge.save();

                // Send success email
                await sendEmail({
                    to: payload.eventData.customer.email,
                    subject: 'Payment Successful',
                    html: `
                        <h1>Payment Successful</h1>
                        <p>Amount: ${payment.amount}</p>
                        <p>Reference: ${payment.reference}</p>
                        <p>Date: ${payment.paidAt.toLocaleDateString()}</p>
                    `,
                });
                break;

            case 'FAILED_TRANSACTION':
                payment.status = 'failed';
                await serviceCharge.save();

                // Send failure email
                await sendEmail({
                    to: payload.eventData.customer.email,
                    subject: 'Payment Failed',
                    html: `
                        <h1>Payment Failed</h1>
                        <p>Amount: ${payment.amount}</p>
                        <p>Reference: ${payment.reference}</p>
                        <p>Please try again or contact support if the issue persists.</p>
                    `,
                });
                break;
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
} 