import { Schema, model, models, Model, Types } from 'mongoose';

export interface IEstate {
    _id: Types.ObjectId;
    name: string;
    address: string;
    description?: string;
    admins: Types.ObjectId[];
    members: Types.ObjectId[];
    serviceOfferings: {
        _id: Types.ObjectId;
        name: string;
        description: string;
        price: number;
    }[];
    joinRequests: {
        _id: Types.ObjectId;
        user: Types.ObjectId;
        status: 'pending' | 'approved' | 'rejected';
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const estateSchema = new Schema<IEstate>({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    serviceOfferings: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    joinRequests: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
}, {
    timestamps: true,
});

// Compound indexes for better query performance
estateSchema.index({ admins: 1, status: 1 });
estateSchema.index({ members: 1, status: 1 });

export const Estate: Model<IEstate> = models.Estate || model<IEstate>('Estate', estateSchema); 