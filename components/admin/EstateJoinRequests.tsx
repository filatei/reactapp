"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface JoinRequest {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface Estate {
    _id: string;
    name: string;
    joinRequests: JoinRequest[];
}

interface EstateJoinRequestsProps {
    estate: Estate;
}

export function EstateJoinRequests({ estate }: EstateJoinRequestsProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            setIsLoading(requestId);
            const response = await fetch(`/api/estates/${estate._id}/join/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Failed to ${action} request`);
            }

            toast.success(`Join request ${action}ed`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Failed to ${action} request`);
        } finally {
            setIsLoading(null);
        }
    };

    const pendingRequests = estate.joinRequests.filter(req => req.status === 'pending');

    if (pendingRequests.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                No pending join requests
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
                {pendingRequests.map((request) => (
                    <Card key={request._id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">{request.user.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {request.user.email}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRequestAction(request._id, 'reject')}
                                        disabled={isLoading === request._id}
                                    >
                                        {isLoading === request._id ? 'Rejecting...' : 'Reject'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleRequestAction(request._id, 'approve')}
                                        disabled={isLoading === request._id}
                                    >
                                        {isLoading === request._id ? 'Approving...' : 'Approve'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    );
} 