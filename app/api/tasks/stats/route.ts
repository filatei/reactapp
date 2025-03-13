import { NextResponse } from 'next/server';
import { Task } from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { startOfDay, addDays } from 'date-fns';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        // Get all tasks
        const tasks = await Task.find();

        // Calculate task status distribution
        const completed = tasks.filter(task => task.status === 'done').length;
        const inProgress = tasks.filter(task => task.status === 'in-progress').length;
        const todo = tasks.filter(task => task.status === 'todo').length;

        // Calculate priority distribution
        const priorities = {
            high: tasks.filter(task => task.priority === 'high').length,
            medium: tasks.filter(task => task.priority === 'medium').length,
            low: tasks.filter(task => task.priority === 'low').length,
        };

        // Calculate upcoming deadlines (next 7 days)
        const today = startOfDay(new Date());
        const nextWeek = addDays(today, 7);
        const upcomingDeadlines = tasks.filter(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return dueDate && dueDate >= today && dueDate <= nextWeek;
        }).length;

        return NextResponse.json({
            total: tasks.length,
            completed,
            inProgress,
            todo,
            priorities,
            upcomingDeadlines,
        });
    } catch (error) {
        console.error('Error fetching task statistics:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
} 