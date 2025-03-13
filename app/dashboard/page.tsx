import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CreditCard, Bell, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Dashboard | Home',
    description: 'Your personal dashboard',
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Welcome back, {session.user.name}</h1>
                <Link href="/tasks/new">
                    <Button>
                        New Task <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Tasks</h3>
                        <Link href="/tasks">
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Pending Tasks</span>
                            <span className="text-sm font-medium">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Completed Tasks</span>
                            <span className="text-sm font-medium">0</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Service Charges</h3>
                        <Link href="/profile">
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Outstanding Charges</span>
                            <span className="text-sm font-medium">$0.00</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Paid Charges</span>
                            <span className="text-sm font-medium">$0.00</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <Link href="/inbox">
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Unread Messages</span>
                            <span className="text-sm font-medium">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">System Notifications</span>
                            <span className="text-sm font-medium">0</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
} 