import mongoose from 'mongoose';

export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    phoneNumber?: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    provider?: string;
    providerId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
    {
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
        },
        password: {
            type: String,
            required: function () {
                return !this.provider;
            },
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        provider: {
            type: String,
            trim: true,
        },
        providerId: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 