import { NextResponse } from 'next/server';
import { Task } from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { Session } from 'next-auth';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const tasks = await Task.find()
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');
        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        console.log('Session data:', JSON.stringify(session, null, 2));

        await dbConnect();
        const body = await request.json();

        // Get user from database based on email
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Add the current user as the creator using the MongoDB _id
        const task = await Task.create({
            ...body,
            createdBy: user._id
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        return NextResponse.json(populatedTask, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
} 