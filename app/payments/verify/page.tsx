'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentVerificationPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const reference = searchParams.get('ref');
                const provider = searchParams.get('provider');

                if (!reference || !provider) {
                    setStatus('error');
                    setMessage('Invalid payment verification request');
                    return;
                }

                const response = await fetch(`/api/payments/verify?ref=${reference}&provider=${provider}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Payment verification failed');
                }

                setStatus('success');
                setMessage('Payment verified successfully');
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'Payment verification failed');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6">
                {status === 'loading' && (
                    <div className="text-center">
                        <LoadingSpinner className="mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
                        <p className="text-muted-foreground">Please wait while we verify your payment...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Payment Successful</h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <Button onClick={() => router.push('/dashboard')} className="w-full">
                            Return to Dashboard
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <Button onClick={() => router.push('/dashboard')} className="w-full">
                            Return to Dashboard
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
} 