"use client";

import { useState } from 'react';
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

interface SerializedUser {
    _id: string;
    name: string;
    email: string;
}

interface SerializedEstate {
    _id: string;
    name: string;
    address: string;
    description?: string;
    admins: SerializedUser[];
    members: SerializedUser[];
    joinRequests: {
        _id: string;
        user: SerializedUser;
        status: 'pending' | 'approved' | 'rejected';
        createdAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

interface EstateUserListProps {
    estate: SerializedEstate;
}

export function EstateUserList({ estate }: EstateUserListProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleRemoveUser = async (userId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/estates/${estate._id}/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove user');
            }

            toast({
                title: "Success",
                description: "User removed successfully",
            });
            // Refresh the page to show updated list
            window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove user",
                variant: "destructive",
            });
            console.error('Error removing user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/estates/${estate._id}/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAdmin: !isAdmin }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            toast({
                title: "Success",
                description: `User role updated to ${isAdmin ? 'member' : 'admin'}`,
            });
            // Refresh the page to show updated list
            window.location.reload();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user role",
                variant: "destructive",
            });
            console.error('Error updating user role:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {estate.admins.map((admin) => (
                        <TableRow key={admin._id}>
                            <TableCell>{admin.name}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>
                                <Badge variant="default">Admin</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleAdmin(admin._id, true)}
                                        disabled={loading}
                                    >
                                        Make Member
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveUser(admin._id)}
                                        disabled={loading}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {estate.members.map((member) => (
                        <TableRow key={member._id}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">Member</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleAdmin(member._id, false)}
                                        disabled={loading}
                                    >
                                        Make Admin
                                    </Button>
                                    <Button className="bg-red-500 hover:bg-red-600 text-white"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveUser(member._id)}
                                        disabled={loading}
                                    >
                                        Remove
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