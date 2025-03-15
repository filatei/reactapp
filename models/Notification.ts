import { Schema, model, models, Model, Types } from 'mongoose';

export interface INotification {
    _id: Types.ObjectId;
    recipient: Types.ObjectId;
    sender: Types.ObjectId;
    title: string;
    message: string;
    type: 'direct' | 'broadcast' | 'system';
    isRead: boolean;
    estate?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['direct', 'broadcast', 'system'],
        default: 'direct'
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    estate: {
        type: Schema.Types.ObjectId,
        ref: 'Estate'
    }
}, {
    timestamps: true
});

// Compound indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification: Model<INotification> = models.Notification || model<INotification>('Notification', notificationSchema); 