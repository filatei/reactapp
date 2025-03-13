import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
});

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            payment_method_types: ['card', 'bank_transfer'],
        });

        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

export async function createCheckoutSession(amount: number, currency: string = 'usd') {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'bank_transfer'],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: 'Service Payment',
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?payment=cancelled`,
        });

        return session;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
} 