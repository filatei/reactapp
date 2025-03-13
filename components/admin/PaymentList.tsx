"use client";

import { IUser } from '@/models/User';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Payment {
    _id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    userId: IUser;
}

interface PaymentListProps {
    payments: Payment[];
}

export function PaymentList({ payments }: PaymentListProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'failed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={payment._id}>
                            <TableCell>
                                <div>
                                    <div className="font-medium">{payment.userId.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {payment.userId.email}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(payment.status)}>
                                    {payment.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {new Date(payment.createdAt).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 