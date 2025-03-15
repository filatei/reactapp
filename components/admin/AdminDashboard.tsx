"use client";

import { useState } from 'react';
import { IUser } from '@/models/User';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { UserList } from './UserList';
import { ServiceChargeList } from './ServiceChargeList';
import { PaymentList } from './PaymentList';
import { NotificationForm } from './NotificationForm';
import { CreditCard, Users, Bell, AlertCircle, Building2 } from 'lucide-react';
import Link from 'next/link';

interface AdminDashboardProps {
    users: IUser[];
    payments: any[];
    serviceCharges: any[];
    paymentStats: {
        total: number;
        pending: number;
        completed: number;
        failed: number;
    };
    usersWithOutstandingPayments: any[];
}

export function AdminDashboard({
    users,
    payments,
    serviceCharges,
    paymentStats,
    usersWithOutstandingPayments,
}: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="service-charges">Service Charges</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="estates" asChild>
                    <Link href="/admin/estates" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Estates
                    </Link>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${paymentStats.total.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{paymentStats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Service Charges</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {serviceCharges.filter(sc => sc.status === 'active').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Users with Outstanding Payments</CardTitle>
                        <CardDescription>Users who have pending payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {usersWithOutstandingPayments.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{user.user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">${user.totalAmount.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">Outstanding</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="users">
                <UserList users={users} />
            </TabsContent>

            <TabsContent value="payments">
                <PaymentList payments={payments} />
            </TabsContent>

            <TabsContent value="service-charges">
                <ServiceChargeList serviceCharges={serviceCharges} />
            </TabsContent>

            <TabsContent value="notifications">
                <NotificationForm users={users} />
            </TabsContent>
        </Tabs>
    );
} 