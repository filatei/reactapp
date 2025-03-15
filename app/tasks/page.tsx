import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TaskList } from '@/components/TaskList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import dbConnect from '@/lib/mongoose';
import { Task, ITask } from '@/models/Task';
import { User } from '@/models/User';
import { Types } from 'mongoose';

export const metadata: Metadata = {
    title: 'Tasks | ReactiveApp',
    description: 'Manage your tasks',
};

export default async function TasksPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    
    // Get current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
        redirect('/auth/signin');
    }

    // Get all tasks
    const tasks = (await Task.find()
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .lean()) as unknown as (ITask & { _id: Types.ObjectId })[];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <Link href="/tasks/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                </Link>
            </div>

            <TaskList tasks={tasks} view="list" />
        </div>
    );
} 