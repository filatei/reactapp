import { IUser } from '@/models/User';
import { Types } from 'mongoose';

export interface ServiceChargeWithUsers {
    _id: Types.ObjectId;
    title: string;
    description: string;
    amount: number;
    type: 'annual' | 'incidental';
    category: 'maintenance' | 'repairs' | 'utilities' | 'security' | 'other';
    status: 'active' | 'paid' | 'cancelled';
    dueDate?: Date;
    createdBy: IUser;
    affectedUsers: IUser[];
    paidBy: IUser[];
    createdAt: Date;
    updatedAt: Date;
} 