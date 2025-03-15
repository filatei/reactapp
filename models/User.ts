import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'admin' | 'estate_admin';
    provider?: string;
    providerId?: string;
    phoneNumber?: string;
    address?: string;
    estate?: Types.ObjectId;
    estateJoinRequests: {
        estate: mongoose.Types.ObjectId;
        status: 'pending' | 'approved' | 'rejected';
        requestedAt: Date;
        updatedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: function (this: IUser) {
            return !this.provider; // Password is required only if not using OAuth
        },
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'estate_admin'],
        default: 'user',
        index: true,
    },
    provider: {
        type: String,
        enum: ['google', 'github', 'facebook', 'email'],
    },
    providerId: {
        type: String,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    estate: {
        type: Schema.Types.ObjectId,
        ref: 'Estate',
        index: true,
    },
    estateJoinRequests: [{
        estate: {
            type: Schema.Types.ObjectId,
            ref: 'Estate',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    }],
}, {
    timestamps: true,
});

// Compound indexes for better query performance
UserSchema.index({ 'estateJoinRequests.estate': 1, 'estateJoinRequests.status': 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 