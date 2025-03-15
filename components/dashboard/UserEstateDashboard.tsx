"use client";

import { IEstate } from '@/models/Estate';
import { ITask } from '@/models/Task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaBuilding, FaBell, FaUsers } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/TaskList';

interface SerializedEstate extends Omit<IEstate, '_id' | 'admins' | 'members'> {
    _id: string;
    admins: { _id: string; name: string; email: string; }[];
    members: { _id: string; name: string; email: string; }[];
}

interface SerializedTask extends Omit<ITask, '_id' | 'estate' | 'createdBy' | 'assignedTo' | 'createdAt' | 'updatedAt' | 'dueDate'> {
    _id: string;
    estate: string;
    createdBy: { _id: string; name: string; email: string; };
    assignedTo?: { _id: string; name: string; email: string; } | null;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
}

interface UserEstateDashboardProps {
    estates: SerializedEstate[];
    tasks: SerializedTask[];
}

export function UserEstateDashboard({ estates, tasks }: UserEstateDashboardProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {estates.map(estate => {
                    const estateTasks = tasks.filter(t => t.estate.toString() === estate._id.toString());
                    const pendingTasks = estateTasks.filter(t => t.status === 'todo').length;
                    const inProgressTasks = estateTasks.filter(t => t.status === 'in-progress').length;
                    const completedTasks = estateTasks.filter(t => t.status === 'done').length;

                    return (
                        <Card key={estate._id.toString()} className="bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle className="text-xl font-bold">
                                        {estate.name}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {estate.address}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <FaUsers className="h-4 w-4" />
                                        <span>{estate.members.length} Members</span>
                                    </div>
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <FaBuilding className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold">{pendingTasks}</div>
                                            <p className="text-xs text-muted-foreground">Pending Tasks</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold">{inProgressTasks}</div>
                                            <p className="text-xs text-muted-foreground">In Progress</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold">{completedTasks}</div>
                                            <p className="text-xs text-muted-foreground">Completed Tasks</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">Recent Tasks</h2>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/estates/${estate._id}/tasks`)}
                                        >
                                            View All Tasks
                                        </Button>
                                    </div>
                                    <TaskList
                                        tasks={estateTasks.slice(0, 5)}
                                        view="list"
                                    />
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">Estate Updates</h2>
                                        <FaBell className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-muted-foreground">
                                                No new updates
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
} 