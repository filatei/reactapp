import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserEstateDashboard } from '@/components/dashboard/UserEstateDashboard';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import { Estate } from '@/models/Estate';
import { Task } from '@/models/Task';
import { Types } from 'mongoose';

interface PopulatedUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
}

type LeanTask = {
    _id: Types.ObjectId;
    estate: { _id: Types.ObjectId; name: string; address: string };
    createdBy: { _id: Types.ObjectId; name: string; email: string };
    assignedTo?: { _id: Types.ObjectId; name: string; email: string } | null;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
};

export const metadata: Metadata = {
    title: 'Dashboard | ReactiveApp',
    description: 'View your estate and tasks',
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
        redirect('/auth/signin');
    }

    // If user is admin, show admin dashboard
    if (user.role === 'admin') {
        redirect('/admin');
    }

    // Get user's estates (where they are a member or admin)
    console.log('User ID:', user._id);
    
    const estates = await Estate.find({
        $or: [
            { members: user._id },
            { admins: user._id }
        ]
    })
    .select('name address description admins members serviceOfferings')
    .populate<{ admins: PopulatedUser[] }>('admins', 'name email')
    .populate<{ members: PopulatedUser[] }>('members', 'name email')
    .populate('serviceOfferings')
    .lean();

    console.log('Found estates:', JSON.stringify(estates, null, 2));

    if (estates.length === 0) {
        // Let's also check all estates to see what's available
        const allEstates = await Estate.find().lean();
        console.log('All estates in system:', allEstates);
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
                <div className="bg-card rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold mb-4">Welcome to ReactiveApp</h2>
                    <p className="text-muted-foreground mb-6">
                        You are not currently a member of any estate. Join an estate to start managing tasks and services.
                    </p>
                    <a 
                        href="/estates" 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Browse Available Estates
                    </a>
                </div>
            </div>
        );
    }

    // Format estates data
    const formattedEstates = estates.map(estate => ({
        ...estate,
        _id: estate._id.toString(),
        admins: estate.admins.map(admin => ({
            ...admin,
            _id: admin._id.toString()
        })),
        members: estate.members.map(member => ({
            ...member,
            _id: member._id.toString()
        })),
        serviceOfferings: estate.serviceOfferings?.map(service => ({
            ...service,
            _id: service._id.toString()
        })) || []
    }));

    // Get tasks for all user's estates
    const tasks = await Task.find({
        estate: { $in: estates.map(e => e._id) },
        $or: [
            { createdBy: user._id },
            { assignedTo: user._id }
        ]
    })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('estate', 'name address')
    .sort({ createdAt: -1 })
    .lean()
    .then(tasks => (tasks as unknown as LeanTask[]).map(task => ({
        ...task,
        _id: task._id.toString(),
        estate: task.estate._id.toString(),
        createdBy: {
            ...task.createdBy,
            _id: task.createdBy._id.toString()
        },
        assignedTo: task.assignedTo ? {
            ...task.assignedTo,
            _id: task.assignedTo._id.toString()
        } : null,
        createdAt: new Date(task.createdAt).toISOString(),
        updatedAt: new Date(task.updatedAt).toISOString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined
    })));

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
            <UserEstateDashboard estates={formattedEstates} tasks={tasks} />
        </div>
    );
} 