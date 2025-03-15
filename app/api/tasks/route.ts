import { NextResponse } from 'next/server';
import { Task } from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { Session } from 'next-auth';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { Types } from 'mongoose';

// Helper function to convert MongoDB documents to plain objects
function toPlainObject(doc: any) {
    const obj = JSON.parse(JSON.stringify(doc));
    // Convert all _id fields from objects to strings
    if (obj._id) obj._id = obj._id.toString();
    if (obj.createdBy?._id) obj.createdBy._id = obj.createdBy._id.toString();
    if (obj.assignedTo?._id) obj.assignedTo._id = obj.assignedTo._id.toString();
    if (obj.estate?._id) obj.estate._id = obj.estate._id.toString();
    return obj;
}

export async function GET() {
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
            return NextResponse.json([]);
        }

        let tasks;
        if (user.role === 'admin' || user.role === 'estate_admin') {
            // Admins and estate admins can see all tasks in their estate
            tasks = await Task.find({ estate: user.estate })
                .populate('assignedTo', 'name email')
                .populate('createdBy', 'name email')
                .populate('estate', 'name address')
                .lean();
        } else {
            // Regular users can only see tasks they created or are assigned to
            tasks = await Task.find({
                estate: user.estate,
                $or: [
                    { createdBy: user._id },
                    { assignedTo: user._id }
                ]
            })
                .populate('assignedTo', 'name email')
                .populate('createdBy', 'name email')
                .populate('estate', 'name address')
                .lean();
        }

        // Convert MongoDB documents to plain objects
        const plainTasks = tasks.map(toPlainObject);
        return NextResponse.json(plainTasks);
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

        await dbConnect();
        const body = await request.json();

        // Get user from database based on email
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user belongs to an estate
        if (!user.estate) {
            return NextResponse.json({ error: 'User must belong to an estate to create tasks' }, { status: 400 });
        }

        // Add the current user as the creator and include estate
        const task = await Task.create({
            ...body,
            createdBy: user._id,
            estate: user.estate
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('estate', 'name address')
            .lean();

        // Convert MongoDB document to plain object
        const plainTask = toPlainObject(populatedTask);
        return NextResponse.json(plainTask, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
} 