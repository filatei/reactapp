"use client";

import { useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { FaBuilding, FaUsers, FaEnvelope, FaClock } from 'react-icons/fa';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Estate {
    _id: string;
    name: string;
    address: string;
    description?: string;
    admins: Array<{
        _id: string;
        name: string;
        email: string;
    }>;
    members: Array<{
        _id: string;
        name: string;
        email: string;
    }>;
    joinRequests: Array<{
        _id: string;
        user: string;
        status: 'pending' | 'approved' | 'rejected';
    }>;
}

interface AvailableEstatesListProps {
    estates: Estate[];
}

export function AvailableEstatesList({ estates }: AvailableEstatesListProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedEstate, setSelectedEstate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingEstateName, setPendingEstateName] = useState('');

    // Function to check if user has a pending request for an estate
    const hasPendingRequest = (estate: Estate) => {
        return estate.joinRequests.some(request => request.status === 'pending');
    };

    // Function to check if user has an approved request for an estate
    const hasApprovedRequest = (estate: Estate) => {
        return estate.joinRequests.some(request => request.status === 'approved');
    };

    const columns: ColumnDef<Estate>[] = [
        {
            id: 'select',
            header: '',
            cell: ({ row }) => {
                const estate = row.original;
                const isPending = hasPendingRequest(estate);
                const isApproved = hasApprovedRequest(estate);
                
                if (isPending || isApproved) {
                    return null; // Don't show radio button if there's a pending or approved request
                }
                
                return (
                    <RadioGroupItem
                        value={estate._id}
                        checked={selectedEstate === estate._id}
                        onClick={() => setSelectedEstate(estate._id)}
                    />
                );
            },
        },
        {
            accessorKey: 'name',
            header: 'Estate Name',
            cell: ({ row }) => {
                const estate = row.original;
                const isPending = hasPendingRequest(estate);
                const isApproved = hasApprovedRequest(estate);
                
                return (
                    <div className="flex items-center space-x-2">
                        <FaBuilding className="text-primary" />
                        <span className="font-medium">{estate.name}</span>
                        {isPending && (
                            <span className="text-yellow-500 text-sm">(Pending Request)</span>
                        )}
                        {isApproved && (
                            <span className="text-green-500 text-sm">(Approved)</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'address',
            header: 'Address',
            cell: ({ row }) => (
                <div className="hidden md:table-cell">{row.getValue('address')}</div>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div className="hidden lg:table-cell">{row.getValue('description')}</div>
            ),
        },
        {
            accessorKey: 'members',
            header: 'Members',
            cell: ({ row }) => (
                <div className="flex items-center space-x-1">
                    <FaUsers className="text-muted-foreground" />
                    <span>{row.original.members.length}</span>
                </div>
            ),
        },
        {
            accessorKey: 'admins',
            header: 'Admins',
            cell: ({ row }) => (
                <div className="flex items-center space-x-1">
                    <FaEnvelope className="text-muted-foreground" />
                    <span>{row.original.admins.length}</span>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: estates,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            globalFilter,
        },
    });

    const handleJoinRequest = async () => {
        if (!selectedEstate) {
            toast.error('Please select an estate to join');
            return;
        }

        const estate = estates.find(e => e._id === selectedEstate);
        if (!estate) return;

        // Check if user already has a pending request
        if (hasPendingRequest(estate)) {
            setPendingEstateName(estate.name);
            setShowPendingModal(true);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/estates/${selectedEstate}/join`, {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send join request');
            }

            toast.success('Join request sent successfully');
            // Refresh the page to update the UI
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send join request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Search estates..."
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(String(event.target.value))}
                    className="max-w-sm"
                />
                <Button
                    onClick={handleJoinRequest}
                    disabled={!selectedEstate || isLoading || hasPendingRequest(estates.find(e => e._id === selectedEstate) || estates[0])}
                    className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white"
                >
                    <FaEnvelope />
                    <span>{isLoading ? 'Sending...' : 'Request to Join'}</span>
                </Button>
            </div>

            <RadioGroup value={selectedEstate || ''} onValueChange={setSelectedEstate}>
                <ScrollArea className="h-[calc(100vh-16rem)] md:h-[calc(100vh-12rem)]">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No estates found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </ScrollArea>
            </RadioGroup>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} estate(s) found
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FaClock className="text-yellow-500" />
                            Pending Join Request
                        </DialogTitle>
                        <DialogDescription>
                            You already have a pending join request for {pendingEstateName}. Please wait for the estate administrators to review your request.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
} 