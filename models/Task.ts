import mongoose, { Types } from 'mongoose';

export interface ITask {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    estate: Types.ObjectId;
    createdBy: Types.ObjectId;
    assignedTo?: Types.ObjectId;
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
    estate: { type: mongoose.Schema.Types.ObjectId, ref: 'Estate', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

// Add compound indexes for better query performance
taskSchema.index({ estate: 1, createdBy: 1 });
taskSchema.index({ estate: 1, status: 1 });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema); 