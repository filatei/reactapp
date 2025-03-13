import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Task } from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const id = request.nextUrl.pathname.split('/').pop();
        await dbConnect();
        const task = await Task.findById(id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const id = request.nextUrl.pathname.split('/').pop();
        const body = await request.json();
        await dbConnect();

        const task = await Task.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        )
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const id = request.nextUrl.pathname.split('/').pop();
        await dbConnect();
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
} 