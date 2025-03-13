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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface UserListProps {
    users: IUser[];
}

export function UserList({ users }: UserListProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoading(userId);
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            toast({
                title: 'Success',
                description: 'User role updated successfully',
            });
        } catch (error) {
            console.error('Error updating user role:', error);
            toast({
                title: 'Error',
                description: 'Failed to update user role',
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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.address}</TableCell>
                            <TableCell>
                                <Select
                                    defaultValue={user.role}
                                    onValueChange={(value) => handleRoleChange(user._id, value)}
                                    disabled={loading === user._id}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.location.href = `/admin/users/${user._id}`}
                                >
                                    View Details
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 