"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';

interface Payment {
    _id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    serviceType: string;
    description: string;
    paymentDate: string;
    createdAt: string;
}

const columnHelper = createColumnHelper<Payment>();

const columns = [
    columnHelper.accessor('serviceType', {
        header: 'Service',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('amount', {
        header: 'Amount',
        cell: info => `${info.getValue()} ${info.row.original.currency}`,
    }),
    columnHelper.accessor('paymentMethod', {
        header: 'Payment Method',
        cell: info => info.getValue().replace('_', ' ').toUpperCase(),
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => (
            <span className={`px-2 py-1 rounded-full text-xs ${
                info.getValue() === 'completed' ? 'bg-green-100 text-green-800' :
                info.getValue() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                info.getValue() === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {info.getValue().toUpperCase()}
            </span>
        ),
    }),
    columnHelper.accessor('paymentDate', {
        header: 'Payment Date',
        cell: info => format(new Date(info.getValue()), 'MMM d, yyyy'),
    }),
];

export default function PaymentHistory() {
    const [sorting, setSorting] = useState<SortingState>([]);
    
    const { data: payments, isLoading } = useQuery({
        queryKey: ['payments'],
        queryFn: async () => {
            const response = await fetch('/api/payments');
            if (!response.ok) throw new Error('Failed to fetch payments');
            return response.json();
        },
    });

    const table = useReactTable({
        data: payments || [],
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (isLoading) {
        return <div>Loading payment history...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 