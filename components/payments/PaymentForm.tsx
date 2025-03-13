"use client";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';

interface PaymentFormProps {
    amount: number;
    serviceType: string;
    description: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentForm({ amount, serviceType, description }: PaymentFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const { mutate: createCheckoutSession } = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/payments/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    serviceType,
                    description,
                }),
            });
            if (!response.ok) throw new Error('Failed to create checkout session');
            return response.json();
        },
        onSuccess: async (data) => {
            const stripe = await stripePromise;
            if (!stripe) throw new Error('Stripe failed to load');

            const { error } = await stripe.redirectToCheckout({
                sessionId: data.sessionId,
            });

            if (error) {
                console.error('Error:', error);
                setIsLoading(false);
            }
        },
        onError: (error) => {
            console.error('Error:', error);
            setIsLoading(false);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        createCheckoutSession();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <h3 className="text-lg font-medium">Payment Details</h3>
                <p className="text-sm text-gray-500">Amount: ${amount}</p>
                <p className="text-sm text-gray-500">Service: {serviceType}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : 'Pay with Stripe'}
            </button>
        </form>
    );
} 