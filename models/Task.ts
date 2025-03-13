import mongoose, { Types } from 'mongoose';

export interface ITask {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    createdBy: mongoose.Types.ObjectId | string;
    assignedTo?: {
        name: string;
        email: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema); 