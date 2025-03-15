import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

async function createTransporter() {
    try {
        const accessToken = await oauth2Client.getAccessToken();

        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_FROM,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: accessToken?.token || undefined,
            },
        });
    } catch (error) {
        console.error('Error creating email transporter:', error);
        throw error;
    }
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export function generatePaymentSuccessEmail(data: {
    userName: string;
    amount: number;
    chargeTitle: string;
    transactionRef: string;
    paymentMethod: string;
    date: string;
}) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d3748;">Payment Confirmation</h2>
            <p>Dear ${data.userName},</p>
            <p>Your payment has been successfully processed. Here are the details:</p>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Amount:</strong> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(data.amount)}</p>
                <p><strong>Service Charge:</strong> ${data.chargeTitle}</p>
                <p><strong>Transaction Reference:</strong> ${data.transactionRef}</p>
                <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                <p><strong>Date:</strong> ${data.date}</p>
            </div>
            
            <p>Thank you for your payment. If you have any questions, please don't hesitate to contact us.</p>
            
            <p style="color: #718096; font-size: 0.875rem;">
                Best regards,<br>
                Your Service Team
            </p>
        </div>
    `;
}

export function generatePaymentFailureEmail(data: {
    userName: string;
    amount: number;
    chargeTitle: string;
    transactionRef: string;
    paymentMethod: string;
    date: string;
    error: string;
}) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e53e3e;">Payment Failed</h2>
            <p>Dear ${data.userName},</p>
            <p>We regret to inform you that your payment was not successful. Here are the details:</p>
            
            <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Amount:</strong> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(data.amount)}</p>
                <p><strong>Service Charge:</strong> ${data.chargeTitle}</p>
                <p><strong>Transaction Reference:</strong> ${data.transactionRef}</p>
                <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Error:</strong> ${data.error}</p>
            </div>
            
            <p>Please try again or contact our support team if you need assistance.</p>
            
            <p style="color: #718096; font-size: 0.875rem;">
                Best regards,<br>
                Your Service Team
            </p>
        </div>
    `;
} 