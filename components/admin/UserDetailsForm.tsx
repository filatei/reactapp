"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    provider: string;
    providerId: string;
    address: string;
    phoneNumber: string;
    createdAt: string | null;
    updatedAt: string | null;
}

interface UserDetailsFormProps {
    user: User;
}

export function UserDetailsForm({ user: initialUser }: UserDetailsFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState(initialUser);
    const [isLoading, setIsLoading] = useState(false);

    useRealtimeUpdates((data) => {
        if (data.type === 'USER_UPDATED' && data.userId === user.id) {
            setUser(prevUser => ({ ...prevUser, ...data.updates }));
            toast({
                title: 'User Updated',
                description: 'User details have been updated.',
            });
        }
    });

    const handleRoleChange = async (newRole: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            // The actual update will come through SSE
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update user role',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <div className="text-lg font-medium">{user.name}</div>
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="text-lg font-medium">{user.email}</div>
                </div>
                <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                        value={user.role}
                        onValueChange={handleRoleChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="provider">Auth Provider</Label>
                    <Input
                        id="provider"
                        value={user.provider}
                        disabled
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        value={user.address}
                        disabled
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                        id="phoneNumber"
                        value={user.phoneNumber}
                        disabled
                        className="mt-1"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Created At</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                            {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <Label>Last Updated</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 