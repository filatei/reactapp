"use client";

import { useState } from 'react';
import { IUser } from '@/models/User';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface ServiceCharge {
    _id: string;
    title: string;
    description: string;
    amount: number;
    type: 'annual' | 'incidental';
    category: 'maintenance' | 'repairs' | 'utilities' | 'security' | 'other';
    status: 'active' | 'paid' | 'cancelled';
    dueDate?: string;
    createdBy: IUser;
    affectedUsers: IUser[];
    paidBy: IUser[];
}

interface ServiceChargeListProps {
    serviceCharges: ServiceCharge[];
}

export function ServiceChargeList({ serviceCharges }: ServiceChargeListProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-yellow-500';
            case 'paid':
                return 'bg-green-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleStatusChange = async (chargeId: string, newStatus: string) => {
        setLoading(chargeId);
        try {
            const response = await fetch(`/api/service-charges/${chargeId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update service charge status');
            }

            toast({
                title: 'Success',
                description: 'Service charge status updated successfully',
            });
        } catch (error) {
            console.error('Error updating service charge status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update service charge status',
                variant: 'destructive',
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {serviceCharges.map((charge) => (
                        <TableRow key={charge._id}>
                            <TableCell>
                                <div>
                                    <div className="font-medium">{charge.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {charge.description}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="capitalize">{charge.type}</TableCell>
                            <TableCell className="capitalize">{charge.category}</TableCell>
                            <TableCell>${charge.amount.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(charge.status)}>
                                    {charge.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {charge.dueDate
                                    ? new Date(charge.dueDate).toLocaleDateString()
                                    : 'N/A'}
                            </TableCell>
                            <TableCell>{charge.createdBy.name}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStatusChange(charge._id, 'paid')}
                                        disabled={loading === charge._id || charge.status === 'paid'}
                                    >
                                        Mark as Paid
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStatusChange(charge._id, 'cancelled')}
                                        disabled={loading === charge._id || charge.status === 'cancelled'}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 