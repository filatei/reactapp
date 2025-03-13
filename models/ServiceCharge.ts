import mongoose from 'mongoose';

export interface IServiceCharge {
    title: string;
    description: string;
    amount: number;
    type: 'annual' | 'incidental';
    category: 'maintenance' | 'repairs' | 'utilities' | 'security' | 'other';
    status: 'active' | 'paid' | 'cancelled';
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    affectedUsers: mongoose.Types.ObjectId[];
    paidBy: mongoose.Types.ObjectId[];
}

const serviceChargeSchema = new mongoose.Schema<IServiceCharge>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        type: {
            type: String,
            enum: ['annual', 'incidental'],
            required: true,
        },
        category: {
            type: String,
            enum: ['maintenance', 'repairs', 'utilities', 'security', 'other'],
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'paid', 'cancelled'],
            default: 'active',
        },
        dueDate: {
            type: Date,
            required: function () {
                return this.type === 'annual';
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        affectedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        paidBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

export const ServiceCharge = mongoose.models.ServiceCharge || mongoose.model<IServiceCharge>('ServiceCharge', serviceChargeSchema); 