import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['created', 'updated', 'completed'],
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    taskTitle: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export interface IActivity {
    _id: mongoose.Types.ObjectId;
    type: 'created' | 'updated' | 'completed';
    taskId: mongoose.Types.ObjectId;
    taskTitle: string;
    userId: mongoose.Types.ObjectId;
    userName: string;
    createdAt: Date;
    updatedAt: Date;
}

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema); 