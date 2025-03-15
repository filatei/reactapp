import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Task, ITask } from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/models/User';
import { Document, Types } from 'mongoose';

interface PopulatedTask extends Omit<ITask, 'createdBy' | 'assignedTo' | 'estate'> {
    _id: Types.ObjectId;
    createdBy: { _id: Types.ObjectId; name: string; email: string; };
    assignedTo?: { _id: Types.ObjectId; name: string; email: string; };
    estate: { _id: Types.ObjectId; name: string; address: string; };
}

// Helper function to convert MongoDB documents to plain objects
function toPlainObject(doc: Document | PopulatedTask | null) {
    if (!doc) return null;
    const obj = JSON.parse(JSON.stringify(doc));
    // Convert all _id fields from objects to strings
    if (obj._id) obj._id = obj._id.toString();
    if (obj.createdBy?._id) obj.createdBy._id = obj.createdBy._id.toString();
    if (obj.assignedTo?._id) obj.assignedTo._id = obj.assignedTo._id.toString();
    if (obj.estate?._id) obj.estate._id = obj.estate._id.toString();
    return obj;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get user to check role and estate
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If user doesn't belong to an estate, they can't see any tasks
        if (!user.estate) {
            return NextResponse.json({ error: 'User must belong to an estate' }, { status: 400 });
        }

        const task = await Task.findOne({
            _id: params.id,
            estate: user.estate
        })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('estate', 'name address')
            .lean() as PopulatedTask | null;

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Check if user has permission to view this task
        const isAdmin = user.role === 'admin' || user.role === 'estate_admin';
        const isCreator = task.createdBy._id.toString() === user._id.toString();
        const isAssigned = task.assignedTo && task.assignedTo._id.toString() === user._id.toString();

        if (!isAdmin && !isCreator && !isAssigned) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Convert MongoDB document to plain object
        const plainTask = toPlainObject(task);
        return NextResponse.json(plainTask);
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();

        await dbConnect();

        // Get user to check role and estate
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If user doesn't belong to an estate, they can't update tasks
        if (!user.estate) {
            return NextResponse.json({ error: 'User must belong to an estate' }, { status: 400 });
        }

        const task = await Task.findOne({
            _id: params.id,
            estate: user.estate
        }).lean() as PopulatedTask | null;

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Check if user has permission to update this task
        const isAdmin = user.role === 'admin' || user.role === 'estate_admin';
        const isCreator = task.createdBy._id.toString() === user._id.toString();
        const isAssigned = task.assignedTo && task.assignedTo._id.toString() === user._id.toString();

        if (!isAdmin && !isCreator && !isAssigned) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true }
        )
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('estate', 'name address')
            .lean() as PopulatedTask | null;

        // Convert MongoDB document to plain object
        const plainTask = toPlainObject(updatedTask);
        return NextResponse.json(plainTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get user to check role and estate
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If user doesn't belong to an estate, they can't delete tasks
        if (!user.estate) {
            return NextResponse.json({ error: 'User must belong to an estate' }, { status: 400 });
        }

        const task = await Task.findOne({
            _id: params.id,
            estate: user.estate
        }).lean() as PopulatedTask | null;

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Only admins, estate admins, and task creators can delete tasks
        const isAdmin = user.role === 'admin' || user.role === 'estate_admin';
        const isCreator = task.createdBy._id.toString() === user._id.toString();

        if (!isAdmin && !isCreator) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await Task.deleteOne({ _id: params.id });
        return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
} 