import Flutterwave from 'flutterwave-node-v3';
import axios from 'axios';
import crypto from 'crypto';

const flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY!,
    process.env.FLUTTERWAVE_SECRET_KEY!
);

interface PaymentDetails {
    amount: number;
    email: string;
    name: string;
    phoneNumber?: string;
    reference: string;
    description: string;
    currency?: string;
    redirectUrl: string;
}

export async function initializeFlutterwavePayment(details: PaymentDetails) {
    try {
        const payload = {
            tx_ref: details.reference,
            amount: details.amount,
            currency: details.currency || 'NGN',
            payment_options: 'card,banktransfer,ussd',
            redirect_url: details.redirectUrl,
            customer: {
                email: details.email,
                name: details.name,
                phonenumber: details.phoneNumber,
            },
            customizations: {
                title: 'Service Charge Payment',
                description: details.description,
                logo: 'https://your-logo-url.com/logo.png',
            },
            meta: {
                source: 'web',
            },
        };

        const response = await flw.Charge.card(payload);
        return response;
    } catch (error) {
        console.error('Flutterwave payment error:', error);
        throw error;
    }
}

export async function verifyFlutterwavePayment(transactionId: string) {
    try {
        const response = await flw.Transaction.verify({ id: transactionId });
        return response;
    } catch (error) {
        console.error('Flutterwave verification error:', error);
        throw error;
    }
}

export async function initializeMonnifyPayment(details: PaymentDetails) {
    try {
        const auth = Buffer.from(
            `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
        ).toString('base64');

        const payload = {
            amount: details.amount,
            customerName: details.name,
            customerEmail: details.email,
            paymentReference: details.reference,
            paymentDescription: details.description,
            currencyCode: details.currency || 'NGN',
            contractCode: process.env.MONNIFY_CONTRACT_CODE,
            redirectUrl: details.redirectUrl,
            paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD'],
        };

        const response = await axios.post(
            `${process.env.MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
            payload,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Monnify payment error:', error);
        throw error;
    }
}

export async function verifyMonnifyPayment(reference: string) {
    try {
        const auth = Buffer.from(
            `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
        ).toString('base64');

        const response = await axios.get(
            `${process.env.MONNIFY_BASE_URL}/api/v1/merchant/transactions/query?paymentReference=${reference}`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Monnify verification error:', error);
        throw error;
    }
}

export function validateMonnifyWebhook(requestBody: any, signature: string) {
    const hash = crypto
        .createHash('sha512')
        .update(JSON.stringify(requestBody) + process.env.MONNIFY_SECRET_KEY)
        .digest('hex');
    return hash === signature;
}

export function validateFlutterwaveWebhook(requestBody: any, signature: string) {
    const hash = crypto
        .createHash('sha256')
        .update(process.env.FLUTTERWAVE_SECRET_KEY + JSON.stringify(requestBody))
        .digest('hex');
    return hash === signature;
} 