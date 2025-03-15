import mongoose, { Schema, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface IPayment extends Document {
    userId: Types.ObjectId | IUser;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    provider: string;
    reference: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    provider: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    metadata: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Create indexes
PaymentSchema.index({ userId: 1 });
// PaymentSchema.index({ reference: 1 }, { unique: true });
PaymentSchema.index({ status: 1 });

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema); 