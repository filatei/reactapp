import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { ServiceCharge } from '@/models/ServiceCharge';
import { verifyFlutterwavePayment, verifyMonnifyPayment } from '@/lib/payment';
import { sendEmail } from '@/lib/email';
import { Types } from 'mongoose';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const reference = searchParams.get('ref');
        const provider = searchParams.get('provider');

        if (!reference || !provider) {
            return NextResponse.json(
                { error: 'Missing reference or provider' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find the service charge with the payment reference
        const serviceCharge = await ServiceCharge.findOne({
            'payments.reference': reference
        });

        if (!serviceCharge) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Find the specific payment
        const payment = serviceCharge.payments.find((p: { reference: string }) => p.reference === reference);
        if (!payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Skip verification if payment is already verified
        if (payment.status === 'success') {
            return NextResponse.json({
                status: 'success',
                message: 'Payment already verified'
            });
        }

        let verificationResponse;

        // Verify payment based on provider
        if (provider === 'flutterwave') {
            verificationResponse = await verifyFlutterwavePayment(reference);
            if (verificationResponse.status === 'success') {
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
                    to: session.user.email,
                    subject: 'Payment Successful',
                    html: `
                        <h1>Payment Successful</h1>
                        <p>Amount: ${payment.amount}</p>
                        <p>Reference: ${payment.reference}</p>
                        <p>Date: ${payment.paidAt.toLocaleDateString()}</p>
                    `,
                });
            }
        } else if (provider === 'monnify') {
            verificationResponse = await verifyMonnifyPayment(reference);
            if (verificationResponse.responseBody.paymentStatus === 'PAID') {
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
                    to: session.user.email,
                    subject: 'Payment Successful',
                    html: `
                        <h1>Payment Successful</h1>
                        <p>Amount: ${payment.amount}</p>
                        <p>Reference: ${payment.reference}</p>
                        <p>Date: ${payment.paidAt.toLocaleDateString()}</p>
                    `,
                });
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid payment provider' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            status: payment.status,
            message: payment.status === 'success' ? 'Payment verified successfully' : 'Payment verification failed'
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
} 